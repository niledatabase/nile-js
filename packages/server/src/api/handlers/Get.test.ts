import { X_NILE_TENANT } from '../../utils/fetch';
import { Config } from '../../utils/Config';
import { appRoutes } from '../utils/routes/defaultRoutes';

import GETTER from './GET';

jest.mock('../utils/auth', () => () => 'a session, relax');

describe('getter', () => {
  const apiGet = GETTER(appRoutes(), new Config());
  global.fetch = jest.fn();

  beforeEach(() => {
    //@ts-expect-error - fetch
    global.fetch.mockClear();
  });

  [
    'me',
    'users',
    'users/${userId}',
    'tenants',
    'tenants/{tenantId}',
    'auth/signin',
    'tenants/${tenantId}/users/${userId}',
    'tenants/{tenantId}/users',
    'users/${userId}/tenants',
  ].forEach((key) => {
    it(`matches ${key} `, async () => {
      const headersArray: { key: string; value: string }[] = [];
      let params: Request = {} as Request;

      const req = {
        nextUrl: {
          pathname: `/api/${key}`,
        },
        method: 'GET',
        headers: new Headers({
          [X_NILE_TENANT]: '123',
          host: 'http://localhost:3000',
        }),
        url: `http://localhost:3001/api/${key}`,
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
        {
          key: 'niledb-creds',
          value: 'c2hoaGg6c3VwZXJfc2VjcmV0',
        },
        { key: 'niledb-origin', value: 'http://localhost:3001' },
        { key: X_NILE_TENANT, value: '123' },
      ]);
    });
  });
});
