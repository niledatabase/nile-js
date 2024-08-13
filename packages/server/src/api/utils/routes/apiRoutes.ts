import { makeRestUrl } from './makeRestUrl';

type ApiRouteKeys = keyof typeof apiRoutes;
export type ApiRoutePaths = (typeof apiRoutes)[ApiRouteKeys];
export const apiRoutes = {
  ME: makeRestUrl('/me'),
  USERS: (tenantId?: string) =>
    makeRestUrl('/users', tenantId ? { tenantId } : undefined),
  USER: (userId: string) => makeRestUrl(`/users/${userId}`),
  TENANTS: makeRestUrl('/tenants'),
  TENANT: (tenantId: string) => makeRestUrl(`/tenants/${tenantId}`),
  SIGNUP: makeRestUrl('/signup'),
  TENANT_USERS: (tenantId: string) => makeRestUrl(`/tenants/${tenantId}/users`),
  TENANT_USER: (tenantId: string, userId: string) =>
    makeRestUrl(`/tenants/${tenantId}/users/${userId}`),
  USER_TENANTS: (userId: string) => makeRestUrl(`/users/${userId}/tenants`),
};
