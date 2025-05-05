import { ApiRoutePaths, ProxyPaths } from './utils/routes';

export type Paths = ProxyPaths & ApiRoutePaths;

export type Routes = {
  SIGNIN: string;
  SESSION: string;
  PROVIDERS: string;
  CSRF: string;
  CALLBACK: string;
  SIGNOUT: string;
  ERROR: string;
  ME: string;
  USER_TENANTS: string;
  USERS: string;
  TENANTS: string;
  TENANT: string;
  TENANT_USER: string;
  TENANT_USERS: string;
  SIGNUP: string;
  VERIFY_REQUEST: string;
  PASSWORD_RESET: string;
  LOG: string;
};
