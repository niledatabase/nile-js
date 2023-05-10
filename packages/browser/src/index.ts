// all of this is generated in the build step

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
