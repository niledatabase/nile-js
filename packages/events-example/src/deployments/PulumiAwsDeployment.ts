
import { CliUx } from "@oclif/core";
import { 
  DestroyResult,
    InlineProgramArgs, 
    LocalWorkspace, 
    LocalWorkspaceOptions, 
    PulumiFn, 
    Stack, 
    StackSummary, 
    UpResult
} from "@pulumi/pulumi/automation";
import { Instance } from "@theniledev/js";
import AWSConfig from "./AWSConfig";

export interface PulumiFnGen {
  (staticContent: any): PulumiFn
}

export default class PulumiAwsDeployment {

    projectName!: string;
    private workspace!: LocalWorkspace;
    private programGen!: PulumiFnGen;
    private awsConfig!: AWSConfig;

    static async create(
      projectName: string,
      opts: LocalWorkspaceOptions,
      programGenerator: PulumiFnGen,
      awsConfig: AWSConfig
    ): Promise<PulumiAwsDeployment> {
        const ws = await LocalWorkspace.create(opts);
        ws.installPlugin('aws', 'v4.0.0');
        return new PulumiAwsDeployment(projectName, ws, programGenerator, awsConfig);
    };

    constructor(
      projectName: string,
      workspace: LocalWorkspace,
      programGenerator: PulumiFnGen,
      awsConfig: AWSConfig
    ) {
        this.projectName = projectName;
        this.workspace = workspace;
        this.programGen = programGenerator;
        this.awsConfig = awsConfig;
    }

    async loadStacks(): Promise<{[key: string]: StackSummary}> {
      const stacks = await (
          await this.workspace.listStacks()
        ).reduce(async (accP, stack) => {
          const acc = await accP;
          const fullStack = await this.getStack(stack.name, this.programGen({}));
          const info = await fullStack.info();
          if (info?.kind != 'destroy') {
            acc[stack.name] = stack;
            console.debug('adding stack', stack);
          }
          return acc;
        }, Promise.resolve({} as { [key: string]: StackSummary }));
      console.debug(stacks);
      return stacks;
    }

    private async getStack(stackName: string, program: PulumiFn): Promise<Stack> {
      const args: InlineProgramArgs = {
        stackName,
        projectName: this.projectName,
        program,
      };
      const stack = await LocalWorkspace.createOrSelectStack(args);

      await stack.setConfig('aws:region', { value: this.awsConfig.region });    // TODO: generalize AWS config.
      return stack;
    }

    async createStack(instance: Instance): Promise<UpResult> {
      const stack = await this.getStack(instance.id, this.programGen(instance));
      await this.waitOnStack(stack);
      try {
        CliUx.ux.action.start(`Creating a stack id=${instance.id}`);
        return await stack.up({ onOutput: console.log });
      } finally {
        CliUx.ux.action.stop();
      }
    }

    private async waitOnStack(stack: Stack): Promise<void> {
      let stackInfo;
      do {
        stackInfo = await stack.info();
        console.debug(stackInfo);
      } while (stackInfo != undefined && stackInfo?.result !== 'succeeded');
    }
  
    async destroyStack(id: string): Promise<DestroyResult> {
      const stack = await this.getStack(id, this.programGen({}));
      await this.waitOnStack(stack);
      try {
        CliUx.ux.action.start(`Destroying a stack id=${id}`);
        return await stack.destroy({ onOutput: console.log });
      } finally {
        CliUx.ux.action.stop();
      }
    }
}
