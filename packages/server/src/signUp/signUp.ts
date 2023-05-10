import { Config } from '../utils/Config';
import Requester from '../utils/Requester';

export default class SignUp extends Requester {
  constructor(config: Config) {
    const url = `/workspaces/${encodeURIComponent(
      config.workspace
    )}/databases/${encodeURIComponent(config.database)}/users`;
    super(config, url);
  }
}
