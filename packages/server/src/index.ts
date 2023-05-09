import { ServerConfig } from './types';
import { Config } from './utils/Config';
import Login from './login/login';

class Server {
  config: Config;
  login: Login['login'];

  constructor(config: ServerConfig) {
    this.config = new Config(config);
    const _login = new Login(this.config);
    this.login = _login.login;
  }
}

export default Server;
