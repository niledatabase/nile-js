import { Config } from '../utils/Config';
import Requester, { NileRequest, NileResponse } from '../utils/Requester';
import { UUID, decode, encode } from '../utils/uuid';

export default class Tenants extends Config {
  uuid: UUID;
  constructor(config: Config) {
    super(config);
    this.uuid = {
      decode: (input: string) => decode(input),
      encode: (input: string) => encode(input, 'ten_'),
    };
  }
  get tenantUrl() {
    return `/workspaces/${encodeURIComponent(
      this.workspace
    )}/databases/${encodeURIComponent(this.database)}/tenants`;
  }

  createTenant = async (
    req: NileRequest<{ name: string }>,
    init?: RequestInit
  ): NileResponse<void> => {
    const _requester = new Requester(this);

    return _requester.post(req, this.tenantUrl, init);
  };
}
