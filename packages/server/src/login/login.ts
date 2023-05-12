import { ResponseError } from '../utils/ResponseError';
import { Config } from '../utils/Config';
import Requester from '../utils/Requester';

export default class Login extends Config {
  constructor(config: Config) {
    super(config);
  }
  get url() {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}/users/login`;
  }

  login = async (req: Request, init?: RequestInit): Promise<Response> => {
    const headers = new Headers(req.headers);
    const _requester = new Requester(this, this.url);
    const res = await _requester.post(req, init);
    if (res instanceof ResponseError) {
      return res.response;
    }

    const token = await res.json();
    const cookie = `${this.cookieKey}=${token.jwt}; path=/; samesite=lax; httponly;`;
    headers.set('set-cookie', cookie);
    return new Response(JSON.stringify(token), { status: 200, headers });
  };
}
