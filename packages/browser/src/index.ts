// these files are generated in the build step
export * from './openapi/src/models';
export * from './openapi/src/apis';
import {
  AuthenticationApi,
  UsersApi,
  Configuration,
  ConfigurationParameters,
} from './openapi/src';

export default class Browser {
  auth: AuthenticationApi;
  users: UsersApi;
  constructor(params: ConfigurationParameters) {
    const config = new Configuration(params);
    this.auth = new AuthenticationApi(config);
    this.users = new UsersApi(config);
  }
}
