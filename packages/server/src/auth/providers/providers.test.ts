import { Config } from '../../utils/Config';
import { FakeRequest, FakeResponse, _fetch } from '../../../test/fetch.mock';
import Auth from '../';

jest.mock('../../utils/ResponseError', () => ({
  ResponseError: jest.fn(),
}));

describe('getProvider', () => {
  it('does a get', async () => {
    //@ts-expect-error - test
    global.Response = FakeResponse;
    //@ts-expect-error - test
    global.Request = FakeRequest;
    global.fetch = _fetch();
    const { getProvider } = new Auth(
      new Config({
        workspace: 'workspace',
        database: 'database',
        tenantId: 'tenantId',
      })
    );

    const res = await getProvider('okta');
    //@ts-expect-error - test
    expect(res.config).toEqual(
      'https://prod.thenile.dev/workspaces/workspace/databases/database/tenants/tenantId/auth/oidc/providers/okta'
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
    const { updateProvider } = new Auth(
      new Config({
        workspace: 'workspace',
        database: 'database',
        tenantId: 'tenantId',
      })
    );

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
      'https://prod.thenile.dev/workspaces/workspace/databases/database/tenants/tenantId/auth/oidc/providers/okta'
    );
  });
});
