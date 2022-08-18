import {
  ConfigMap,
  InlineProgramArgs,
  LocalWorkspace,
  PulumiFn,
  Stack,
  UpdateSummary,
} from '@pulumi/pulumi/automation';
import { Instance } from '@theniledev/js';
import { Deployment, NileCommandFlags } from '@theniledev/agent';
import { CliUx } from '@oclif/core';

import { PulumiInstanceGen } from '../model/PulumiInstanceGen';

export class PulumiAwsDeployment implements Deployment {
  projectName!: string;
  private localWorkspace!: LocalWorkspace;
  private pulumiProgram: PulumiInstanceGen;

  static async create(
    projectName: string,
    pulumiProgram: PulumiInstanceGen
  ): Promise<PulumiAwsDeployment> {
    const ws = await LocalWorkspace.create({
      projectSettings: { name: projectName, runtime: 'nodejs' },
    });
    ws.installPlugin('aws', 'v4.0.0');
    return new PulumiAwsDeployment(projectName, ws, pulumiProgram);
  }

  private static upSuccessStatuses = ['in-progress', 'succeeded'];

  constructor(
    projectName: string,
    localWorkspace: LocalWorkspace,
    pulumiProgram: PulumiInstanceGen
  ) {
    this.projectName = projectName;
    this.localWorkspace = localWorkspace;
    this.pulumiProgram = pulumiProgram;
  }

  async identifyRemoteObjects(): Promise<string[]> {
    const f = NileCommandFlags;
    return await (
      await this.localWorkspace.listStacks()
    ).reduce(async (accP, stack) => {
      const acc = await accP;
      const fullStack = await this.getStack(stack.name, this.pulumiProgram());
      const info = await fullStack.info();
      if (info?.kind != 'destroy') {
        acc.push(stack.name);
      }
      return acc;
    }, Promise.resolve([] as string[]));
  }

  private async getStack(stackName: string, program: PulumiFn): Promise<Stack> {
    const args: InlineProgramArgs = {
      stackName,
      projectName: this.projectName,
      program,
    };
    const stack = await LocalWorkspace.createOrSelectStack(args);
    return stack;
  }

  async createObject(instance: Instance): Promise<boolean> {
    const stack = await this.getStack(
      instance.id,
      this.pulumiProgram(instance)
    );
    await this.configureStack(stack, instance);
    await this.waitOnStack(stack);

    try {
      CliUx.ux.action.start(`Creating a stack id=${instance.id}`);
      // eslint-disable-next-line no-console
      const upResult = await stack.up({ onOutput: console.log });
      return PulumiAwsDeployment.upSuccessStatuses.includes(
        upResult.summary.result
      );
    } finally {
      CliUx.ux.action.stop();
    }
  }

  private async configureStack(stack: Stack, instance: Instance) {
    const instanceProps = instance.properties as { config: ConfigMap };
    const stackConfig = instanceProps?.config ?? { 'aws:region': 'us-east-2' };

    for (const key of Object.keys(stackConfig)) {
      await stack.setConfig(key, { value: `${stackConfig[key]}` });
    }
  }

  private async waitOnStack(stack: Stack): Promise<void> {
    let stackInfo;
    do {
      stackInfo = await stack.info();
    } while (this.isUnresolved(stackInfo));
  }

  private isUnresolved(stackInfo: UpdateSummary | undefined): boolean {
    return (
      stackInfo != undefined &&
      !(stackInfo?.result == 'succeeded' || stackInfo?.result == 'failed')
    );
  }

  async destroyObject(id: string): Promise<boolean> {
    const stack = await this.getStack(id, this.pulumiProgram());
    await this.waitOnStack(stack);
    try {
      CliUx.ux.action.start(`Destroying a stack id=${id}`);
      // eslint-disable-next-line no-console
      const destroyResult = await stack.destroy({ onOutput: console.log });
      return PulumiAwsDeployment.upSuccessStatuses.includes(
        destroyResult.summary.result
      );
    } finally {
      CliUx.ux.action.stop();
    }
  }
}
