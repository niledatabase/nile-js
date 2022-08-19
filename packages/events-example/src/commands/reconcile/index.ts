import { Command, Flags } from '@oclif/core';
import { Instance, LoginInfo } from '@theniledev/js';
import NileAgent, {
  NileCommandFlags,
  ReconciliationPlan,
} from '@theniledev/agent';
import { PulumiAwsDeployment } from '@theniledev/pulumi';

import { pulumiS3 } from '../../pulumi/pulumiS3';

export default class Reconcile extends Command {
  static enableJsonFlag = true;
  static description =
    'reconcile Nile instance definitions with deployed objects';
  static flags = Object.assign({}, NileCommandFlags, {
    entity: Flags.string({
      char: 'e',
      description: 'an entity type in your Nile workspace',
      required: true,
      env: 'NILE_ENTITY',
    }),
  });

  async run(): Promise<unknown> {
    const { flags } = await this.parse(Reconcile);
    const {
      dryRun,
      basePath,
      workspace,
      org,
      entity,
      email,
      password,
      authToken,
    } = flags;

    // nile setup
    const nile = await NileAgent.connect(
      {
        basePath,
        workspace,
      },
      {
        authToken,
        email,
        password,
      }
    );

    const instances = await NileAgent.loadEntityInstances(nile, org, entity);

    // pulumi setup
    const deployment = await PulumiAwsDeployment.create(
      'nile-examples',
      pulumiS3
    );

    // find ids of current data plane objects
    const extantIds = await deployment.identifyRemoteObjects();

    // identify objects for creation and destruction
    const plan = new ReconciliationPlan(instances, extantIds);

    if (dryRun) {
      this.log(
        `Pending destruction: ${plan.destructionIds} (${plan.destructionIds.length})`
      );
      this.log(
        `Pending creation: ${plan.creationIds} (${plan.creationIds.length})`
      );
      return { stacks: extantIds, instances };
    }

    // load or remove stacks based on Nile
    await NileAgent.synchronizeDataPlane(plan, deployment);

    // listen to updates from nile and handle stacks accordingly
    await NileAgent.watchEntityEvents(
      nile,
      org,
      entity,
      this.findLastSeq(instances),
      deployment
    );
  }

  /**
   * Find sequence number of the last Instance in the collection.
   * @param instances Array<Instance> info about Pulumi stacks
   * @returns the max value of `seq`, which is the most recent Instance
   */
  private findLastSeq(instances: Instance[]): number {
    return instances
      .map((value: Instance) => value?.seq || 0)
      .reduce((prev: number, curr: number) => {
        return Math.max(prev, curr || 0);
      }, 0);
  }
}
