import { Config } from '../../utils/Config';
import { FakeRequest, FakeResponse, _fetch } from '../../../test/fetch.mock';
import Auth from '../';

jest.mock('../../utils/ResponseError', () => ({
  ResponseError: jest.fn(),
}));

const config = {
  workspace: 'workspace',
  database: 'database',
  tenantId: 'tenantId',
};
describe('getProviders', () => {
  it('does a get', async () => {
    //@ts-expect-error - test
    global.Response = FakeResponse;
    //@ts-expect-error - test
    global.Request = FakeRequest;
    global.fetch = _fetch();
    const _config = new Config(config);
    const { getProviders } = new Auth(_config);

    const res = await getProviders();
    //@ts-expect-error - test
    expect(res.config).toEqual(
      _config.api.basePath +
        '/workspaces/workspace/databases/database/tenants/auth/oidc/providers'
    );
  });
});

describe('updateProvider', () => {
  it('does a put', async () => {
    //@ts-expect-error - test
    global.Response = FakeResponse;
    //@ts-expect-error - test
    global.Request = FakeRequest;
    global.fetch = _fetch();
    const _config = new Config(config);
    const { updateProvider } = new Auth(_config);

    const res = await updateProvider({
      configUrl: '',
      clientId: '',
      clientSecret: '',
      redirectURI: '',
      emailDomains: [],
      enabled: true,
    });
    //@ts-expect-error - test
    expect(res.config).toEqual(
      _config.api.basePath +
        '/workspaces/workspace/databases/database/tenants/tenantId/auth/oidc/providers/okta'
    );
  });
});