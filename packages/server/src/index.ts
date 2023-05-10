import { ServerConfig } from './types';
import { Config } from './utils/Config';
import Login from './login';
import SignUp from './signUp';

class Server {
  config: Config;
  login: Login['login'];
  signUp: SignUp['post'];

  constructor(config: ServerConfig) {
    this.config = new Config(config);
    const _login = new Login(this.config);
    const _signUp = new SignUp(this.config);
    this.login = _login.login;
    this.signUp = _signUp.post;
  }
}

export default Server;
