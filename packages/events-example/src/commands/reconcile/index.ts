import { Command, Flags } from '@oclif/core';
import Nile, { Instance, NileApi } from '@theniledev/js';

import { pulumiProgramGenerator } from '../../pulumiS3';
import PulumiAwsDeployment from '../../deployments/pulumi';

export default class Reconcile extends Command {
  static enableJsonFlag = true;
  static description = 'reconcile nile/pulumi deploys';

  static flags = {
    basePath: Flags.string({
      description: 'basePath',
      default: 'http://localhost:8080',
    }),
    workspace: Flags.string({
      description: 'workspace',
      default: 'tryhard',
    }),
    email: Flags.string({
      description: 'email',
      default: 'trying@demo.com',
    }),
    password: Flags.string({
      description: 'password',
      default: 'trying',
    }),
    organization: Flags.string({ description: 'organization' }),
    entity: Flags.string({ description: 'entity' }),
    status: Flags.boolean({ char: 's', description: 'status', default: false }),
  };

  nile!: NileApi;
  deployment!: PulumiAwsDeployment;

  async loadInstances(
    organization: string,
    entity: string
  ): Promise<{ [key: string]: Instance }> {
    const instances = (
      await this.nile.entities.listInstances({
        org: organization,
        type: entity,
      })
    ).reduce((acc, instance: Instance) => {
      if (instance) {
        acc[instance.id] = instance;
      }

      return acc;
    }, {} as { [key: string]: Instance });
    this.debug(instances);
    return instances;
  }

  async run(): Promise<any> {
    const { flags } = await this.parse(Reconcile);

    // pulumi setup
    this.deployment = await PulumiAwsDeployment.create(
      "tryhard", 
      { projectSettings: { name: flags.workspace, runtime: 'nodejs' } },
      pulumiProgramGenerator
    )

    // nile setup
    this.nile = Nile({ basePath: flags.basePath, workspace: flags.workspace });
    const token = await this.nile.developers
      .loginDeveloper({
        loginInfo: {
          email: flags.email,
          password: flags.password,
        },
      })
      .catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
    this.nile.authToken = token?.token;

    // load our data
    const stacks = await this.deployment.loadStacks();
    const instances = await this.loadInstances(
      flags.organization,
      flags.entity
    );
    let seq = 0;
    for (const instance of Object.values(instances)) {
      if (seq == null || (instance?.seq || seq) > seq) {
        seq = instance?.seq || seq;
      }
    }

    if (flags.status) {
      return { stacks, instances };
    }

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

    await new Promise(() => {
      this.nile.events.on({ type: flags.entity, seq }, async (e) => {
        this.log(JSON.stringify(e, null, 2));
        if (e.after) {
          const out = await (e.after.deleted
            ? this.deployment.destroyStack(e.after.id)
            : this.deployment.createStack(e.after));

          this.debug(out);
        }
      });
    });
  }
}
