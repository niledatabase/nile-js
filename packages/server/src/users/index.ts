import { Config } from '../utils/Config';
import Requester from '../utils/Requester';
import { ResponseError } from '../utils/ResponseError';
import { handleTenantId } from '../utils/fetch';
import { UUID, decode, encode } from '../utils/uuid';

export default class Auth extends Config {
  uuid: UUID;
  constructor(config: Config) {
    super(config);
    this.uuid = {
      decode: (input: string) => decode(input),
      encode: (input: string) => encode(input, 'usr_'),
    };
  }
  get createTenantUserUrl() {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}/tenants/${
      this.tenantId
    }/users`;
  }

  createTenantUser = async (
    req: Request | { email: string; password: string },
    init?: RequestInit
  ): Promise<Response> => {
    const _requester = new Requester(this);
    if (!(req instanceof Request)) {
      return _requester.rawRequest(
        'POST',
        this.createTenantUserUrl,
        JSON.stringify(req),
        init
      );
    }
    const error = handleTenantId(new Headers(req.headers), this);
    if (error instanceof ResponseError) {
      return error.response;
    }

    return _requester.post(req, this.createTenantUserUrl, init);
  };
}
