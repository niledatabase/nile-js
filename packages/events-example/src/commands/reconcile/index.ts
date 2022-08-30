import { Command, Flags } from '@oclif/core';
import Nile, { Instance, NileApi } from '@theniledev/js';

import { PulumiAwsDeployment, pulumiS3 } from '../../pulumi';
import { Deployment, ReconciliationPlan } from '../../utils';

export default class Reconcile extends Command {
  static enableJsonFlag = true;
  static description =
    'reconcile Nile instance definitions with deployed objects';
  static flags = {
    basePath: Flags.string({
      char: 'p',
      description: 'root URL for the Nile API',
      required: true,
      env: 'NILE_BASE_PATH',
      default: 'https://prod.thenile.dev:443',
    }),
    workspace: Flags.string({
      char: 'w',
      description: 'your Nile workspace name',
      required: true,
      env: 'NILE_WORKSPACE',
    }),
    org: Flags.string({
      char: 'o',
      description: 'an organization in your Nile workspace',
      required: true,
      env: 'NILE_ORG',
    }),
    entity: Flags.string({
      char: 'e',
      description: 'an entity type in your Nile workspace',
      required: true,
      env: 'NILE_ENTITY',
    }),
    email: Flags.string({
      description: 'your Nile developer email address',
      env: 'NILE_EMAIL',
    }),
    password: Flags.string({
      description: 'your Nile developer password',
      env: 'NILE_PASSWORD',
    }),
    authToken: Flags.string({
      description:
        'Developer access token. If used, this overrides the email/password flags.',
      env: 'NILE_AUTH_TOKEN',
    }),
    dryRun: Flags.boolean({
      description: 'check current status of your control and data planes',
      default: false,
    }),
  };

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
    const nile = await Nile({
      basePath,
      workspace,
    }).connect(authToken ?? { email, password });

    const instances = await this.loadEntityInstances(nile, org, entity);

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
    await this.synchronizeDataPlane(plan, deployment);

    // listen to updates from nile and handle stacks accordingly
    await this.watchEntityEvents(
      nile,
      org,
      entity,
      this.findLastSeq(instances),
      deployment
    );
  }

  /**
   *  Requests all the instances of a specific Entity type for a single
   *  organization
   * @param nile A connected NileApi object
   * @param org An organization in the Nile workspace
   * @param entityType An entity in the Nile workspace
   * @returns Array<Instance> All instances of the entity for the organization
   */
  async loadEntityInstances(
    nile: NileApi,
    org: string,
    entityType: string
  ): Promise<Instance[]> {
    const instances = await nile.entities.listInstances({
      org,
      type: entityType,
    });

    return instances.filter(
      (value: Instance) => value !== null && value !== undefined
    );
  }

  /**
   * Find sequence number of the last Instance in the collection.
   * @param instances Array<Instance> Nile instance definitions
   * @returns the max value of `seq`, which is the most recent Instance
   */
  private findLastSeq(instances: Instance[]): number {
    return instances
      .map((value: Instance) => value?.seq || 0)
      .reduce((prev: number, curr: number) => {
        return Math.max(prev, curr || 0);
      }, 0);
  }

  /**
   * Applies the reconciliation plan to the deployment, creating or destroying
   * objects in the data plane.
   * @param plan ReconciliationPlan
   * @param deployment Deployment
   */
  private async synchronizeDataPlane(
    plan: ReconciliationPlan,
    deployment: Deployment
  ) {
    // destroy any stacks that should not exist
    for (const id of plan.destructionIds) {
      await deployment.destroyObject(id);
    }

    // create any stacks that should exist
    for (const spec of plan.creationSpecs) {
      await deployment.createObject(spec);
    }
  }

  /**
   * Listens for Nile events and reconciles objects in the data plane.
   * @param nile A connected NileApi object
   * @param org An organization in the Nile workspace
   * @param entityType An entity in the Nile workspace
   * @param fromSeq the starting point to begin listening for events (0 is from the beginning of time)
   * @param deployment Deployment
   */
  private async watchEntityEvents(
    nile: NileApi,
    org: string,
    entityType: string,
    fromSeq: number,
    deployment: Deployment
  ): Promise<void> {
    await new Promise(() => {
      nile.events.on({ type: entityType, seq: fromSeq }, async (e) => {
        if (e.after) {
          await (e.after.deleted
            ? deployment.destroyObject(e.after.id)
            : deployment.createObject(e.after));
        }
      });
    });
  }
}
