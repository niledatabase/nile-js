import { appRoutes } from '../utils/routes';
import { Config } from '../../utils/Config';
import {
  HEADER_ORIGIN,
  HEADER_SECURE_COOKIES,
  TENANT_COOKIE,
} from '../../utils/constants';

import DELETER from './DELETE';

jest.mock('../utils/auth', () => () => 'a session, relax');
describe('DELETER', () => {
  const apiGet = DELETER(
    appRoutes(),
    new Config({ apiUrl: 'http://thenile.dev/v2/databases/testdb' })
  );
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
        [TENANT_COOKIE]: '123',
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
        { key: HEADER_ORIGIN, value: 'http://localhost:3001' },
        { key: HEADER_SECURE_COOKIES, value: 'false' },
      ]);
    });
  });
});
