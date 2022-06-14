/* eslint-disable @typescript-eslint/ban-ts-comment */
import Nile from '..';
import { LoginInfo } from '../generated/openapi/src/models/LoginInfo';

const userPayload = {
  id: 4,
  email: 'bob@squarepants.com',
};
describe('index', () => {
  describe('methods', () => {
    it('has the expected methods', () => {
      const nile = Nile();
      const keys = Object.keys(nile);
      expect(keys).toEqual([
        'users',
        'developers',
        'entities',
        'workspaces',
        'organizations',
      ]);
      keys.forEach((k) => {
        const props = Object.getOwnPropertyNames(
          // @ts-expect-error testing
          Object.getPrototypeOf(nile[k])
        );
        if (k === 'workspaces') {
          expect(props).toEqual([
            'constructor',
            'createWorkspace',
            'listWorkspaces',
          ]);
        }
        if (k === 'organizations') {
          expect(props).toEqual([
            'constructor',
            'acceptInvite',
            'createOrganization',
            'deleteOrganization',
            'getOrganization',
            'listInvites',
            'listOrganizations',
            'updateOrganization',
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
            'listEntities',
            'listInstances',
            'updateEntity',
            'updateInstance',
          ]);
        }
        if (k === 'developers') {
          expect(props).toEqual([
            'constructor',
            'createDeveloper',
            'loginDeveloper',
            'validateDeveloper',
          ]);
        }
        if (k === 'users') {
          expect(props).toEqual([
            'constructor',
            'createUser',
            'deleteUser',
            'getUser',
            'listUsers',
            'loginUser',
            'me',
            'updateUser',
            'validateUser',
          ]);
        }
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
});
