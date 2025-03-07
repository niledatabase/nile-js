import { Config } from '../../../utils/Config';

import { makeRestUrl } from './makeRestUrl';

type ApiRouteKeys = keyof typeof apiRoutes;
export type ApiRoutePaths = (typeof apiRoutes)[ApiRouteKeys];
export const apiRoutes = (config: Config) => ({
  ME: makeRestUrl(config, '/me'),
  USERS: (qp: { tenantId?: null | string; newTenantName?: null | string }) =>
    makeRestUrl(config, '/users', qp),
  USER: (userId: string) => makeRestUrl(config, `/users/${userId}`),
  TENANTS: makeRestUrl(config, '/tenants'),
  TENANT: (tenantId: string) => makeRestUrl(config, `/tenants/${tenantId}`),
  SIGNUP: makeRestUrl(config, '/signup'),
  TENANT_USERS: (tenantId: string) =>
    makeRestUrl(config, `/tenants/${tenantId}/users`),
  TENANT_USER: (tenantId: string, userId: string) =>
    makeRestUrl(config, `/tenants/${tenantId}/users/${userId}`),
  USER_TENANTS: (userId: string) =>
    makeRestUrl(config, `/users/${userId}/tenants`),
});
