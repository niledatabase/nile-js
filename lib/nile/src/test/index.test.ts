/* eslint-disable @typescript-eslint/ban-ts-comment */
import Nile from '..';
import { LoginInfo } from '../client/src/models';

const userPayload = {
  id: 4,
  email: 'bob@squarepants.com',
};
describe('index', () => {
  describe('methods', () => {
    it('has the expected methods/properties', () => {
      const nile = Nile();
      const keys = Object.keys(nile);
      expect(keys).toEqual([
        'config',
        'organizations',
        'workspaces',
        'users',
        'developers',
        'entities',
        'events',
        'access',
        'metrics',
        'auth',
      ]);
      keys.shift();
      keys.forEach((k) => {
        const props = Object.getOwnPropertyNames(
          // @ts-expect-error testing
          Object.getPrototypeOf(nile[k])
        );
        if (k === 'workspaces') {
          expect(nile[k].oidc).toBeTruthy();
          expect(props).toEqual([
            'constructor',
            'createAccessToken',
            'createWorkspace',
            'deleteAccessToken',
            'getAccessToken',
            'getWorkspaceOpenApi',
            'getWorkspaceSettings',
            'listAccessTokens',
            'listWorkspaces',
            'oidcWorkspaceLogin',
            'oidcWorkspaceSignOut',
            'updateAccessToken',
            'updateOIDCProviders',
            'updateOIDCRedirects',
          ]);
        }
        if (k === 'organizations') {
          expect(nile[k].oidc).toBeTruthy();
          expect(props).toEqual([
            'constructor',
            'acceptInvite',
            'addUserToOrg',
            'createOrganization',
            'deleteOrganization',
            'getOrganization',
            'listInvites',
            'listOrganizations',
            'listUsersInOrg',
            'oidcOrganizationLogin',
            'removeUserFromOrg',
            'updateOrganization',
            'updateUserInOrg',
          ]);
        }
        if (k === 'entities') {
          expect(props).toEqual([
            'constructor',
            'createEntity',
            'createInstance',
            'deleteInstance',
            'getEntity',
            'getInstance',
            'getOpenAPI',
            'instanceEvents',
            'listEntities',
            'listInstances',
            'listInstancesInWorkspace',
            'patchInstance',
            'updateEntity',
            'updateInstance',
          ]);
        }
        if (k === 'developers') {
          expect(props).toEqual([
            'constructor',
            'createDeveloper',
            'developerGoogleOAuthCallback',
            'loginDeveloper',
            'startDeveloperGoogleOAuth',
            'validateDeveloper',
          ]);
        }
        if (k === 'users') {
          expect(props).toEqual([
            'constructor',
            'createDeveloperOwnedUser',
            'createUser',
            'deleteUser',
            'getUser',
            'listUsers',
            'loginUser',
            'me',
            'token',
            'updateUser',
            'validateUser',
          ]);
        }
        if (k === 'access') {
          expect(props).toEqual([
            'constructor',
            'createPolicy',
            'deletePolicy',
            'getPolicy',
            'listPolicies',
            'updatePolicy',
          ]);
        }
        if (k === 'metrics') {
          expect(props).toEqual([
            'constructor',
            'aggregateMetrics',
            'filterMetrics',
            'filterMetricsForEntityType',
            'listMetricDefinitions',
            'listMetricDefinitionsForEntityType',
            'produceBatchOfMetrics',
          ]);
        }
        if (k === 'auth') {
          expect(props).toEqual([
            'constructor',
            'managedOidcCallback',
            'managedOidcCallback1',
          ]);
        }
      });
    });

    describe('Nile.connect', () => {
      it('takes a string', () => {
        const nile = Nile().connect('my sweet auth token');
        expect(nile).toBeTruthy();
      });
      it('takes a username/password', async () => {
        // suppress the error from fetch
        const error = jest
          .spyOn(console, 'error')
          .mockImplementation(() => 'fetch not defined');
        const nile = await Nile().connect({
          email: 'patrick@underthesea.com',
          password: 'nothisispatrick',
        });
        expect(nile).toMatchObject(
          Nile().connect({
            email: 'patrick@underthesea.com',
            password: 'nothisispatrick',
          })
        );
        error.mockReset();
      });
    });
  });

  describe('login', () => {
    let payload: LoginInfo;
    beforeEach(() => {
      payload = { email: userPayload.email, password: 'super secret' };
      // @ts-expect-error
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({}),
        })
      );
    });
    afterEach(() => {
      // @ts-expect-error
      fetch.mockClear();
    });

    it('works', async () => {
      // @ts-expect-error
      fetch.mockImplementation(async () => ({
        status: 200,
        json: () => Promise.resolve({ token: '123' }),
        catch: () => null,
      }));
      const nile = Nile();
      await nile.developers.loginDeveloper({ loginInfo: payload });
      expect(nile.authToken).toBeTruthy();
      nile.authToken = nile.developers.authToken;
      expect(nile.users.authToken).toBeTruthy();
      expect(nile.developers.authToken).toBeTruthy();
      expect(nile.entities.authToken).toBeTruthy();
      expect(nile.workspaces.authToken).toBeTruthy();
      expect(nile.organizations.authToken).toBeTruthy();
    });

    it('does not work', async () => {
      // @ts-expect-error
      fetch.mockImplementation(async () => ({
        status: 200,
        json: () => Promise.resolve({}),
        catch: () => null,
      }));
      const nile = Nile();
      await nile.developers.loginDeveloper({ loginInfo: payload });

      expect(nile.authToken).toBeFalsy();
    });

    it('cancels', async () => {
      const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
      // eat the warning, we're gonna make it happen
      jest.spyOn(console, 'warn').mockImplementation(() => null);
      const controller = new AbortController();
      const json = jest.fn();

      // @ts-expect-error
      fetch.mockImplementation(() => ({
        status: 200,
        json,
        catch: () => null,
      }));
      const nile = Nile();
      nile.developers.loginDeveloper(
        { loginInfo: payload },
        { signal: controller.signal }
      );
      controller.abort();
      expect(abortSpy).toBeCalled();
      expect(json).not.toBeCalled();
      expect(nile.authToken).toBeFalsy();
    });
  });
  it('sets a workspace', () => {
    const nile = Nile();
    nile.workspace = '123';
    expect(nile.workspace).toBe('123');
    expect(nile.users.workspace).toBeTruthy();
    expect(nile.developers.workspace).toBeTruthy();
    expect(nile.entities.workspace).toBeTruthy();
    expect(nile.workspaces.workspace).toBeTruthy();
    expect(nile.organizations.workspace).toBeTruthy();
  });
  it('sets the initial workspace', () => {
    const nile = Nile({ workspace: '123' });
    expect(nile.workspace).toBe('123');
    expect(nile.users.workspace).toBe('123');
    expect(nile.developers.workspace).toBe('123');
    expect(nile.entities.workspace).toBe('123');
    expect(nile.workspaces.workspace).toBe('123');
    expect(nile.organizations.workspace).toBe('123');
  });

  describe('oidc', () => {
    it('sets the correct oidc workspace url', () => {
      const nile = Nile({ workspace: '123' });
      expect(nile.workspaces.oidc.providers.GOOGLE()).toEqual(
        'http://localhost:8080/workspaces/123/oidc/providers/GOOGLE/login'
      );
    });
    it('has a logout url', () => {
      const nile = Nile({ workspace: '123' });
      expect(nile.workspaces.oidc.logout).toEqual(
        'http://localhost:8080/workspaces/123/oidc/signout'
      );
    });

    it('sets the correct oidc organization url', () => {
      const nile = Nile({ workspace: '123' });
      expect(nile.organizations.oidc.GOOGLE('myorg')).toEqual(
        'http://localhost:8080/workspaces/123/orgs/myorg/oidc/providers/GOOGLE/login'
      );
    });
  });
});
