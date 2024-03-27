import { Config } from '../../utils/Config';
import { FakeRequest, FakeResponse, _fetch } from '../../../test/fetch.mock';
import Auth from '../';

jest.mock('../../utils/ResponseError', () => ({
  ResponseError: jest.fn(),
}));

const config = {
  databaseId: 'databaseId',
  username: 'username',
  password: 'password',
  tenantId: 'tenantId',
};
describe('listProviders', () => {
  it('does a get', async () => {
    //@ts-expect-error - test
    global.Response = FakeResponse;
    //@ts-expect-error - test
    global.Request = FakeRequest;
    global.fetch = _fetch();
    const _config = new Config(config);
    const { listProviders } = new Auth(_config);

    const res = await listProviders();
    //@ts-expect-error - test
    expect(res.config).toEqual(
      _config.api.basePath + '/databases/databaseId/tenants/auth/oidc/providers'
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
        '/databases/databaseId/tenants/tenantId/auth/oidc/providers/okta'
    );
  });
});
