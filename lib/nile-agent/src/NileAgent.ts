import {
  ConfigurationParameters,
  Instance,
  LoginInfo,
} from '@theniledev/js/dist/generated/openapi/src';
import Nile, { NileApi } from '@theniledev/js';

import { DeveloperCreds, ReconciliationPlan } from './model';
import { Deployment } from './deployments';

export const NileAgent = {
  /**
   * Creates a NileApi instance and connects using the developer credentials
   * provided
   * @param config - the NileApi configuration parameters
   * @param creds - developer credentials; either a username and password or
   *   an auth token are required.
   * @returns NileApi
   */
  async connect(
    config: ConfigurationParameters,
    creds: DeveloperCreds
  ): Promise<NileApi> {
    const nile = Nile(config);
    if (creds.authToken) {
      nile.authToken = creds.authToken;
    } else {
      const token = await nile.developers
        .loginDeveloper({
          loginInfo: {
            email: creds.email || '',
            password: creds.password || '',
          },
        })
        .catch((error: unknown) => {
          // eslint-disable-next-line no-console
          console.error('Nile authentication failed', error);
        });
      nile.authToken = token?.token;
    }
    return nile;
  },

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
  },

  /**
   * Applies the reconciliation plan to the deployment, creating or destroying
   * objects in the data plane.
   * @param plan ReconciliationPlan
   * @param deployment Deployment
   */
  async synchronizeDataPlane(plan: ReconciliationPlan, deployment: Deployment) {
    // destroy any stacks that should not exist
    for (const id of plan.destructionIds) {
      await deployment.destroyObject(id);
    }

    // create any stacks that should exist
    for (const spec of plan.creationSpecs) {
      await deployment.createObject(spec);
    }
  },

  /**
   * Listens for Nile events and reconciles objects in the data plane.
   * @param nile A connected NileApi object
   * @param org An organization in the Nile workspace
   * @param entityType An entity in the Nile workspace
   * @param fromSeq the starting point to begin listening for events (0 is from the beginning of time)
   * @param deployment Deployment
   */
  async watchEntityEvents(
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
  },
};
