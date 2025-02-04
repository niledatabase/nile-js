import { ApiRoutePaths } from './utils/routes/apiRoutes';
import { ProxyPaths } from './utils/routes/proxyRoutes';

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
  USERS: string;
  TENANTS: string;
  TENANT_USER: string;
  TENANT_USERS: string;
  SIGNUP: string;
  VERIFY_REQUEST: string;
  PASSWORD_RESET: string;
};
