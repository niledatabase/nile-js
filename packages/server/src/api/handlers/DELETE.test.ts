import { appRoutes } from '../utils/routes/defaultRoutes';
import { Config } from '../../utils/Config';
import { X_NILE_TENANT } from '../../utils/fetch';

import DELETER from './DELETE';

jest.mock('../utils/auth', () => () => 'a session, relax');
describe('DELETER', () => {
  const apiGet = DELETER(appRoutes(), new Config());
  global.fetch = jest.fn();

  beforeEach(() => {
    //@ts-expect-error - fetch
    global.fetch.mockClear();
  });

  [
    'tenants',
    'tenants/{tenantId}',
    'tenants/{tenantId}/users',
    'tenants/${tenantId}/users/${userId}',
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
        headersArray.push({ key, value });
      });
      expect(headersArray).toEqual([
        { key: 'content-type', value: 'text/plain;charset=UTF-8' },
        { key: 'host', value: 'http://localhost:3000' },
        {
          key: 'niledb-creds',
          value: 'c2hoaGg6c3VwZXJfc2VjcmV0',
        },
        { key: 'niledb-origin', value: 'http://localhost:3001' },
      ]);
    });
  });
});
