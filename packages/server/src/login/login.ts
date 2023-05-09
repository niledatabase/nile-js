import { ResponseError } from '../utils/ResponseError';
import { Config } from '../utils/Config';
import { _fetch } from '../utils/fetch';

export default class Login extends Config {
  constructor(config: Config) {
    super(config);
  }
  get url() {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}/users/login`;
  }

  async login(req: Request, init?: RequestInit): Promise<Response> {
    const body = await new Response(req.body).text();
    const headers = new Headers(req.headers);
    const res = await _fetch(this, this.url, {
      ...init,
      body,
      method: 'POST',
    });
    if (res instanceof ResponseError) {
      return res;
    }
    const token = await res.json();
    const cookie = `${this.cookieKey}=${token.token}; path=/; samesite=lax; httponly;`;
    headers.set('set-cookie', cookie);
    return new Response(null, { status: 200, headers });
  }
}
