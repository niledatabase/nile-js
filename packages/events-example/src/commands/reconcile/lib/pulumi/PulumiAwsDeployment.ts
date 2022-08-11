import { CliUx } from '@oclif/core';
import {
  DestroyResult,
  InlineProgramArgs,
  LocalWorkspace,
  PulumiFn,
  Stack,
  StackSummary,
  UpResult,
} from '@pulumi/pulumi/automation';
import { Instance } from '@theniledev/js';

type AWSConfig = {
  region: string;
};
type PulumiFnGen = {
  (staticContent: unknown): PulumiFn;
};

// eslint-disable-next-line no-console
const stackConfig = { onOutput: console.log };

export default class PulumiAwsDeployment {
  projectName!: string;
  private localWorkspace!: LocalWorkspace;
  private pulumiProgram: PulumiFnGen;
  private awsConfig: AWSConfig;

  static async create(
    projectName: string,
    pulumiProgram: PulumiFnGen,
    awsConfig: AWSConfig
  ): Promise<PulumiAwsDeployment> {
    const ws = await LocalWorkspace.create({
      projectSettings: { name: projectName, runtime: 'nodejs' },
    });
    ws.installPlugin('aws', 'v4.0.0');
    return new PulumiAwsDeployment(projectName, ws, pulumiProgram, awsConfig);
  }

  constructor(
    projectName: string,
    localWorkspace: LocalWorkspace,
    pulumiProgram: PulumiFnGen,
    awsConfig: AWSConfig
  ) {
    this.projectName = projectName;
    this.localWorkspace = localWorkspace;
    this.pulumiProgram = pulumiProgram;
    this.awsConfig = awsConfig;
  }

  async loadPulumiStacks(): Promise<{ [key: string]: StackSummary }> {
    const stacks = await (
      await this.localWorkspace.listStacks()
    ).reduce(async (accP, stack) => {
      const acc = await accP;
      const fullStack = await this.getStack(stack.name, this.pulumiProgram({}));
      const info = await fullStack.info();
      if (info?.kind != 'destroy') {
        acc[stack.name] = stack;
      }
      return acc;
    }, Promise.resolve({} as { [key: string]: StackSummary }));
    return stacks;
  }

  async waitOnStack(stack: Stack): Promise<void> {
    let stackInfo;
    do {
      stackInfo = await stack.info();
    } while (stackInfo != undefined && stackInfo?.result !== 'succeeded');
  }

  async getStack(stackName: string, program: PulumiFn): Promise<Stack> {
    const args: InlineProgramArgs = {
      stackName,
      projectName: 'tryhard',
      program,
    };
    const stack = await LocalWorkspace.createOrSelectStack(args);
    await stack.setConfig('aws:region', { value: this.awsConfig.region });
    return stack;
  }

  async createStack(instance: Instance): Promise<UpResult> {
    const stack = await this.getStack(
      instance.id,
      this.pulumiProgram(instance)
    );
    await this.waitOnStack(stack);
    try {
      CliUx.ux.action.start(`Creating a stack id=${instance.id}`);
      return await stack.up(stackConfig);
    } finally {
      CliUx.ux.action.stop();
    }
  }

  async destroyStack(id: string): Promise<DestroyResult> {
    const stack = await this.getStack(id, this.pulumiProgram({}));
    await this.waitOnStack(stack);
    try {
      CliUx.ux.action.start(`Destroying a stack id=${id}`);
      return await stack.destroy(stackConfig);
    } finally {
      CliUx.ux.action.stop();
    }
  }
}
