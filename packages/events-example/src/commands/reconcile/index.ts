import { CliUx, Command, Flags } from '@oclif/core';
import Nile, { Instance, NileApi } from '@theniledev/js';
import {
  DestroyResult,
  InlineProgramArgs,
  LocalWorkspace,
  StackSummary,
  Stack,
  UpResult,
  PulumiFn,
} from '@pulumi/pulumi/automation';

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

  //localWorkspace!: LocalWorkspace;
  nile!: NileApi;
  deployment!: PulumiAwsDeployment;

  /*
  async waitOnStack(stack: Stack): Promise<void> {
    let stackInfo;
    do {
      stackInfo = await stack.info();
      this.debug(stackInfo);
    } while (stackInfo != undefined && stackInfo?.result !== 'succeeded');
  }

  async getStack(stackName: string, program: PulumiFn): Promise<Stack> {
    const args: InlineProgramArgs = {
      stackName,
      projectName: 'tryhard',
      program,
    };
    const stack = await LocalWorkspace.createOrSelectStack(args);
    await stack.setConfig('aws:region', { value: 'us-west-2' });
    return stack;
  }

  async createStack(instance: Instance): Promise<UpResult> {
    const stack = await this.getStack(instance.id, pulumiProgram(instance));
    await this.waitOnStack(stack);
    try {
      CliUx.ux.action.start(`Creating a stack id=${instance.id}`);
      return await stack.up({ onOutput: console.log });
    } finally {
      CliUx.ux.action.stop();
    }
  }

  async destroyStack(id: string): Promise<DestroyResult> {
    const stack = await this.getStack(id, pulumiProgram({}));
    await this.waitOnStack(stack);
    try {
      CliUx.ux.action.start(`Destroying a stack id=${id}`);
      return await stack.destroy({ onOutput: console.log });
    } finally {
      CliUx.ux.action.stop();
    }
  }

  async loadPulumiStacks(): Promise<{ [key: string]: StackSummary }> {
    const stacks = await (
      await this.localWorkspace.listStacks()
    ).reduce(async (accP, stack) => {
      const acc = await accP;
      const fullStack = await this.getStack(stack.name, pulumiProgram({}));
      const info = await fullStack.info();
      if (info?.kind != 'destroy') {
        acc[stack.name] = stack;
        this.debug('adding stack', stack);
      }
      return acc;
    }, Promise.resolve({} as { [key: string]: StackSummary }));
    this.debug(stacks);
    return stacks;
  }
  */

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
    /*
    this.localWorkspace = await LocalWorkspace.create({
      projectSettings: { name: flags.workspace, runtime: 'nodejs' },
    });
    this.localWorkspace.installPlugin('aws', 'v4.0.0');
    */
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
