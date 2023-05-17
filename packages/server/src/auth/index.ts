import { Config } from '../utils/Config';
import Requester from '../utils/Requester';
import { ResponseError } from '../utils/ResponseError';

export default class Auth extends Config {
  constructor(config: Config) {
    super(config);
  }
  get loginUrl() {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}/users/login`;
  }

  login = async (req: Request, init?: RequestInit): Promise<Response> => {
    const headers = new Headers(req.headers);
    const _requester = new Requester(this);
    const res = await _requester.post(req, this.loginUrl, init);
    if (res instanceof ResponseError) {
      return res.response;
    }

    if (res && res.status >= 200 && res.status < 300) {
      const token = await res.json();
      const cookie = `${this.api?.cookieKey}=${token.jwt}; path=/; samesite=lax; httponly;`;
      headers.set('set-cookie', cookie);
      return new Response(JSON.stringify(token), { status: 200, headers });
    }
    const text = await res.text();
    return new Response(text, { status: res.status });
  };

  get signUpUrl() {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}/users`;
  }

  signUp = async (req: Request, init?: RequestInit): Promise<Response> => {
    const _requester = new Requester(this);
    return _requester.post(req, this.signUpUrl, init);
  };
}
