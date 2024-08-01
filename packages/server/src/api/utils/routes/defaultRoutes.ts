import { Routes } from '../../types';

export const appRoutes = (prefix = '/api'): Routes => ({
  SIGNIN: `${prefix}/auth/signin`,
  PROVIDERS: `${prefix}/auth/providers`,
  SESSION: `${prefix}/auth/session`,
  CSRF: `${prefix}/auth/csrf`,
  CALLBACK: `${prefix}/auth/callback`,
  SIGNOUT: `${prefix}/auth/signout`,
  ERROR: `${prefix}/auth/error`,
  ME: `${prefix}/me`,
  USERS: `${prefix}/users`,
  TENANTS: `${prefix}/tenants`,
  TENANT_USER: `${prefix}/tenants/{tenantId}/users/{userId}`,
  TENANT_USERS: `${prefix}/tenants/{tenantId}/users`,
  SIGNUP: `${prefix}/signup`,
});
