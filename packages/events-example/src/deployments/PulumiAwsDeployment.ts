import { CliUx } from "@oclif/core";
import { ConfigMap, DestroyResult, InlineProgramArgs, LocalWorkspace, PulumiFn, Stack, StackSummary, UpdateSummary, UpResult } from "@pulumi/pulumi/automation";
import { Instance } from "@theniledev/js";

export interface PulumiFnGen {
    (instance?: Instance): PulumiFn
  }

export default class PulumiAwsDeployment {

    projectName!: string;
    private localWorkspace!: LocalWorkspace;
    private pulumiProgram: PulumiFnGen;

    static async create(
        projectName: string,
        pulumiProgram: PulumiFnGen,
    ): Promise<PulumiAwsDeployment> {
        const ws = await LocalWorkspace.create({
            projectSettings: { name: projectName, runtime: 'nodejs' },
          });
        ws.installPlugin('aws', 'v4.0.0');
        return new PulumiAwsDeployment(projectName, ws, pulumiProgram)
    }

    constructor(
        projectName: string,
        localWorkspace: LocalWorkspace,
        pulumiProgram: PulumiFnGen,
    ) {
        this.projectName = projectName;
        this.localWorkspace = localWorkspace;
        this.pulumiProgram = pulumiProgram;
    }

    async loadPulumiStacks(): Promise<{ [key: string]: StackSummary }> {
        const stacks = await (
            await this.localWorkspace.listStacks()
        ).reduce(async (accP, stack) => {
            const acc = await accP;
            const fullStack = await this.getStack(stack.name, this.pulumiProgram());
            const info = await fullStack.info();
            if (info?.kind != 'destroy') {
                acc[stack.name] = stack;
            }
            return acc;
        }, Promise.resolve({} as { [key: string]: StackSummary }));
        return stacks;
    }
    
    async getStack(stackName: string, program: PulumiFn): Promise<Stack> {
        console.log(`PulumiAwsDeployments.getStack ${stackName}`);
        
        const args: InlineProgramArgs = {
          stackName,
          projectName: this.projectName,
          program,
        };
        console.log('\tcreateOrSelectStat', args);
        const stack = await LocalWorkspace.createOrSelectStack(args);

        console.log('\tstack retrieved');
        //await stack.setConfig('aws:region', { value: 'us-east-2' });
        return stack;
    }
    
    async createStack(instance: Instance): Promise<UpResult> {
        console.log(`createStack ${ instance.id }`);
        const stack = await this.getStack(instance.id, this.pulumiProgram(instance));
        await this.configureStack(stack, instance);
        await this.waitOnStack(stack);

        try {
          CliUx.ux.action.start(`Creating a stack id=${instance.id}`);
          return await stack.up({ onOutput: console.log });
        } finally {
          CliUx.ux.action.stop();
        }
    }

    private async configureStack(stack: Stack, instance: Instance) {
        const instanceProps = instance.properties as {[key: string]: any} | undefined;
        const stackConfig = instanceProps?.config as ConfigMap ? instanceProps!.config : { "aws:region": "us-east-2" };
        
        console.log(`Config for instance ${ instance.id }`);
        console.log(stackConfig);

        for (const key of Object.keys(stackConfig)) {
            console.log(`setting config ${key} = ${stackConfig[key]}`);
            await stack.setConfig(key, { value: `${stackConfig[key]}` });
        }
    }

    private async waitOnStack(stack: Stack): Promise<void> {
        console.log('waitOnStack');
        let stackInfo;
        do {
            stackInfo = await stack.info();
            console.log(stackInfo);
        } while (this.isUnresolved(stackInfo));
    }

    private isUnresolved(stackInfo: UpdateSummary | undefined): boolean {
        return stackInfo != undefined && !(
            stackInfo?.result == 'succeeded' || 
            stackInfo?.result == 'failed'
        )
    }
    
    async destroyStack(id: string): Promise<DestroyResult> {
        console.log(`destroyStack ${id}`);
        const stack = await this.getStack(id, this.pulumiProgram());
        await this.waitOnStack(stack);
        console.log('proceeding with destroy...');
        try {
          CliUx.ux.action.start(`Destroying a stack id=${id}`);
          return await stack.destroy({ onOutput: console.log });
        } finally {
          CliUx.ux.action.stop();
        }
    }
}
