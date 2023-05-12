// these files are generated in the build step
export * from './openapi/src/models';
export * from './openapi/src/apis';
import {
  AuthenticationApi,
  Configuration,
  ConfigurationParameters,
} from './openapi/src';

export class Client {
  auth: AuthenticationApi;
  constructor(params: ConfigurationParameters) {
    const config = new Configuration(params);
    this.auth = new AuthenticationApi(config);
  }
}
export default function Browser(config?: ConfigurationParameters) {
  return new Client(config ?? {});
}
