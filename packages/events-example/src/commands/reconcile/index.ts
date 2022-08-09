import { Command, Flags } from '@oclif/core';
import { StackSummary } from '@pulumi/pulumi/automation';
import Nile, { Instance, NileApi } from '@theniledev/js';
import PulumiAwsDeployment from '../../deployments/PulumiAwsDeployment';

import { pulumiProgramGenerator } from '../../pulumiS3';

export default class Reconcile extends Command {
  static enableJsonFlag = true;
  static description = 'reconcile nile/pulumi deploys';

  static flags = {
    basePath: Flags.string({
      description: 'root URL for the Nile API',
      default: 'http://localhost:8080',
    }),
    workspace: Flags.string({
      description: 'your Nile workspace name',
      default: 'tryhard',
    }),
    email: Flags.string({
      description: 'developer email address',
      default: 'trying@demo.com',
    }),
    password: Flags.string({
      description: 'developer password',
      default: 'trying',
    }),
    organization: Flags.string({ description: 'an organization in your Nile workspace' }),
    entity: Flags.string({ description: 'an entity type in your Nile workspace' }),
    statusCheckOnly: Flags.boolean({ char: 's', description: 'check current state of control and data planes', default: false }),
    region: Flags.string({ description: 'AWS region', default: 'us-west-2'}),
  };

  nile!: NileApi;
  deployment!: PulumiAwsDeployment;

  async run(): Promise<any> {
    const { flags } = await this.parse(Reconcile);

    // Nile setup
    await this.connectNile(flags);

    // Pulumi setup
    this.deployment = await PulumiAwsDeployment.create(
      flags.workspace, 
      { projectSettings: { name: flags.workspace, runtime: 'nodejs' } },
      pulumiProgramGenerator,
      { region: flags.region },
    )

    // Identify current state of data plane and control plane
    const stacks = await this.deployment.loadStacks();
    const instances = await this.loadNileInstances(flags.organization, flags.entity);

    if (flags.statusCheckOnly) {
      console.log({ stacks, instances });
      return { stacks, instances };
    }

    this.synchronizeDataPlane(instances, stacks);
    this.listenForNileEvents(flags.entity, this.findLastInstance(Object.values(instances)));
  }

  async connectNile(parsedFlags: {[name: string]: any}) {
    this.nile = Nile({ basePath: parsedFlags.basePath, workspace: parsedFlags.workspace });
    const token = await this.nile.developers
      .loginDeveloper({
        loginInfo: {
          email: parsedFlags.email,
          password: parsedFlags.password,
        },
      })
      .catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.error("Nile authentication failed", error);
      });
    this.nile.authToken = token?.token;
  }

  async loadNileInstances(organization: string, entity: string): Promise<{ [key: string]: Instance }> {
    const instances = (
      await this.nile.entities.listInstances({
        org: organization,
        type: entity,
      })
    )
      .filter((value: Instance) => value !== null && value !== undefined)
      .reduce((acc, instance: Instance) => {
        acc[instance.id] = instance;
        return acc;
      }, {} as { [key: string]: Instance });
    this.debug("Nile Instances", instances);
    return instances;
  }

  private findLastInstance(instances: Instance[]): number {
    return instances
      .map((value: Instance) => value?.seq || 0)
      .reduce((prev: number, curr: number) => {
        return Math.max(prev, curr || 0);
      }, 0);
  }

  private synchronizeDataPlane(
    instances: {[key: string]: Instance},
    stacks: {[key: string]: StackSummary}
  ) {
    // destroy any stacks that shouldnt exist
    for (const id of Object.keys(stacks)) {
      if (!instances[id]) {
        this.deployment.destroyStack(id);
      }
    }

    // create any stacks that should exist
    for (const id of Object.keys(instances)) {
      if (!stacks[id]) {
        this.deployment.createStack(instances[id]);
      }
    }
  }

  private async listenForNileEvents(entityType: string, fromSeq: number) {
    await new Promise(() => {
      this.nile.events.on({ type: entityType, seq: fromSeq }, async (e) => {
        this.log(JSON.stringify(e, null, 2));
        if (e.after) {
          const out = await (e.after.deleted
            ? this.deployment.destroyStack(e.after.id)
            : this.deployment.createStack(e.after));

          this.debug("Event Received", out);
        }
      });
    });
  }
}
