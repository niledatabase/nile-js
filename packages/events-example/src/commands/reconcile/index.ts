import { Command } from '@oclif/core';
import Nile, { Instance, NileApi } from '@theniledev/js';

import { ReconciliationPlan } from '../../model/ReconciliationPlan';

import { pulumiS3, PulumiAwsDeployment } from './lib/pulumi';
import { flagDefaults } from './flagDefaults';

// configuration for interacting with nile
type NileConfig = {
  workspace: string; // workspace of the application
  basePath: string; // nile URL (https://prod.thenile.dev)
};
type DeveloperCreds = {
  email: string; // developer email
  password: string; // developer password
};

export default class Reconcile extends Command {
  static enableJsonFlag = true;
  static description = 'reconcile nile/pulumi deploys';

  static flags = flagDefaults;

  deployment!: PulumiAwsDeployment;
  nile!: NileApi;

  async run(): Promise<unknown> {
    const { flags } = await this.parse(Reconcile);
    const {
      status,
      organization,
      entity,
      basePath,
      workspace,
      email,
      password,
    } = flags;

    // nile setup
    await this.connectNile({ basePath, workspace, email, password });
    const instances = await this.loadNileInstances(
      String(organization),
      String(entity)
    );

    // pulumi setup
    this.deployment = await PulumiAwsDeployment.create(
      'nile-examples',
      pulumiS3
    );
    const stacks = await this.deployment.loadPulumiStacks();

    // stitch Nile and Pulumi together
    const plan = new ReconciliationPlan(instances, stacks);

    if (status) {
      this.log('Status check only.');
      this.log(
        `Pending destruction: ${plan.destructionIds} (${plan.destructionIds.length})`
      );
      this.log(
        `Pending creation: ${plan.creationIds} (${plan.creationIds.length})`
      );
      return { stacks, instances };
    }

    // load or remove stacks based on Nile
    await this.synchronizeDataPlane(plan);

    // listen to updates from nile and handle stacks accordingly
    await this.listenForNileEvents(
      String(flags.entity),
      this.findLastSeq(Object.values(instances))
    );
  }

  /**
   * sets up Nile instance, and set auth token to the logged in developer
   * @param config Configuration for instantiating Nile and logging in
   */
  async connectNile({
    basePath,
    workspace,
    email,
    password,
  }: NileConfig & DeveloperCreds) {
    this.nile = Nile({
      basePath,
      workspace,
    });
    const token = await this.nile.developers
      .loginDeveloper({
        loginInfo: {
          email,
          password,
        },
      })
      .catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.error('Nile authentication failed', error);
      });
    this.nile.authToken = token?.token;
  }

  /**
   *  Requests all the instances from a single organization, representing Pulumi stacks
   * @param organization
   * @param entity
   * @returns Array<Instance> info about Pulumi stacks
   */
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
    this.debug('Nile Instances', instances);
    return instances;
  }

  /**
   *
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

  /**
   * Parses the reconciliation plan between Nile and Pulumi, to create or destroy stacks based on Nile as the source of truth
   * @param plan ReconciliationPlan
   */
  private async synchronizeDataPlane(plan: ReconciliationPlan) {
    this.debug('Synchronizing data and control planes...');
    this.debug(plan);

    // destroy any stacks that should not exist
    for (const id of plan.destructionIds) {
      await this.deployment.destroyStack(id);
    }

    // create any stacks that should exist
    for (const spec of plan.creationSpecs) {
      await this.deployment.createStack(spec);
    }
  }

  /**
   * listens for Nile emitting events and destroys or creates Pulumi stacks accordingly
   * @param entityType Entity to listen for events
   * @param fromSeq the starting point to begin listening for events (0 is from the beginning of time)
   */
  private async listenForNileEvents(entityType: string, fromSeq: number) {
    this.log(
      `Listening for events for ${entityType} entities from sequence #${fromSeq}`
    );
    await new Promise(() => {
      this.nile.events.on({ type: entityType, seq: fromSeq }, async (e) => {
        this.log(JSON.stringify(e, null, 2));
        if (e.after) {
          const out = await (e.after.deleted
            ? this.deployment.destroyStack(e.after.id)
            : this.deployment.createStack(e.after));

          this.debug('Event Received', out);
        }
      });
    });
  }
}
