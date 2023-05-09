// all of this is generated in the build step

import {
  AuthenticationApi,
  Configuration,
  ConfigurationParameters,
} from './openapi/src';

export class Client {
  auth: AuthenticationApi;
  users: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createUser: (arg0: any) => void;
  };
  constructor(params: ConfigurationParameters) {
    const config = new Configuration(params);
    this.auth = new AuthenticationApi(config);
    this.users = {
      createUser: () => {
        // going to add this later
      },
    };
  }
}
export default function Builder(config: ConfigurationParameters) {
  return new Client(config);
}
