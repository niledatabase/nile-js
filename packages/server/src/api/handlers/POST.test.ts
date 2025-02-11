import { appRoutes } from '../utils/routes/defaultRoutes';
import { Config } from '../../utils/Config';
import { X_NILE_TENANT } from '../../utils/fetch';

import POSTER from './POST';

jest.mock('../utils/auth', () => () => 'a session, relax');
describe('poster', () => {
  const apiGet = POSTER(
    appRoutes(),
    new Config({ api: { basePath: 'http://thenile.dev/v2/databases/testdb' } })
  );
  global.fetch = jest.fn();

  beforeEach(() => {
    //@ts-expect-error - fetch
    global.fetch.mockClear();
  });

  [
    'auth/signin',
    'tenants',
    'tenants/{tenantId}',
    'tenants/{tenantId}/users',
    'tenants/${tenantId}/users/${userId}',
    'users',
    'users/${userId}',
    'users/${userId}/tenants',
  ].forEach((key) => {
    it(`matches ${key} `, async () => {
      const headersArray: { key: string; value: string }[] = [];
      let params: Request = {} as Request;

      const req = {
        method: 'POST',
        [X_NILE_TENANT]: '123',
        nextUrl: {
          pathname: `/api/${key}`,
        },
        headers: new Headers({ host: 'http://localhost:3000' }),
        url: `http://localhost:3001/api/${key}`,
        clone: jest.fn(() => ({ body: '{}' })),
      };

      //@ts-expect-error - fetch
      global.fetch = jest.fn((url, p) => {
        if (p) {
          params = new Request(url, p);
        }
        return Promise.resolve({ status: 200 });
      });

      const fn = await apiGet(req as unknown as Request);

      expect(fn).toBeTruthy();
      expect(fn?.status).toEqual(200);
      params.headers.forEach((value, key) => {
        if (key !== 'content-type') {
          headersArray.push({ key, value });
        }
      });
      expect(headersArray).toEqual([
        { key: 'host', value: 'localhost:3001' },
        { key: 'niledb-origin', value: 'http://localhost:3001' },
      ]);
    });
  });
});
