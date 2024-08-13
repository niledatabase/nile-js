// these files are generated in the build step
export * from './openapi/src/models';
export * from './openapi/src/apis';
import {
  AuthenticationApi,
  UsersApi,
  Configuration,
  ConfigurationParameters,
  DefaultApi,
  User,
  InitOverrideFunction,
  BaseAPI,
  TenantsApi,
} from './openapi/src';

export default class Browser extends BaseAPI {
  auth: AuthenticationApi;
  users: UsersApi;
  tenants: TenantsApi;
  me: (initOverrides?: RequestInit | InitOverrideFunction) => Promise<User>;
  constructor(params: ConfigurationParameters) {
    super();
    const config = new Configuration(params);
    this.configuration = config;
    this.auth = new AuthenticationApi(config);
    this.tenants = new TenantsApi(config);
    this.users = new UsersApi(config);
    const { me } = new DefaultApi(config);
    this.me = me;
  }
}
