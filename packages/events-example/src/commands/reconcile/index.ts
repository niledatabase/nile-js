import { Command, Flags } from '@oclif/core';
import Nile, { Instance, NileApi } from '@theniledev/js';

import { pulumiProgram } from '../../pulumiS3';
import PulumiAwsDeployment from '../../deployments/PulumiAwsDeployment';
import { ReconciliationPlan } from '../../model/ReconciliationPlan';

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
      default: 'dev',
    }),
    email: Flags.string({
      description: 'developer email address',
      default: 'developer@demo.com',
    }),
    password: Flags.string({
      description: 'developer password',
      default: 'very_secret',
    }),
    organization: Flags.string({ description: 'an organization in your Nile workspace' }),
    entity: Flags.string({ description: 'an entity type in your Nile workspace' }),
    status: Flags.boolean({ char: 's', description: 'check current status of your control and data planes', default: false }),
  };

  deployment!: PulumiAwsDeployment;
  nile!: NileApi;

  async run(): Promise<any> {
    const { flags } = await this.parse(Reconcile);

    // nile setup
    await this.connectNile(flags);

    // pulumi setup
    this.deployment = await PulumiAwsDeployment.create("nile-examples", pulumiProgram);

    // load our data
    const stacks = await this.deployment.loadPulumiStacks();
    const instances = await this.loadNileInstances(
      flags.organization,
      flags.entity
    );
    const plan = new ReconciliationPlan(instances, stacks);

    if (flags.status) {
      this.log('Status check only.');
      this.log(`Pending destruction: ${ plan.destructionIds } (${ plan.destructionIds.length})`);
      this.log(`Pending creation: ${ plan.creationIds } (${ plan.creationIds.length })`)
      return { stacks, instances };
    }

    await this.synchronizeDataPlane(plan);
    await this.listenForNileEvents(flags.entity, this.findLastSeq(Object.values(instances)));
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

  async loadNileInstances(
    organization: string,
    entity: string
  ): Promise<{ [key: string]: Instance }> {
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

  private findLastSeq(instances: Instance[]): number {
    return instances
      .map((value: Instance) => value?.seq || 0)
      .reduce((prev: number, curr: number) => {
        return Math.max(prev, curr || 0);
      }, 0);
  }

  private async synchronizeDataPlane(plan: ReconciliationPlan) {
    this.debug('Synchronizing data and control planes...');
    this.debug(plan);

    // destroy any stacks that should not exist
    for (const id of plan.destructionIds) {
      await this.deployment.destroyStack(id);
    }

    // create any stacks that should exist
    for (const spec of plan.creationSpecs) {
      await this.deployment.createStack(spec)
    }
  }

  private async listenForNileEvents(entityType: string, fromSeq: number) {
    this.log(`Listening for events for ${ entityType } entities from sequence #${ fromSeq }`);
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
