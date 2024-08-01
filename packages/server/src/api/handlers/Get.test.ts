import { appRoutes } from '../utils/routes/defaultRoutes';

import GETTER from './GET';

describe('getter', () => {
  const apiGet = GETTER(appRoutes());
  global.fetch = jest.fn();

  beforeEach(() => {
    //@ts-expect-error - fetch
    global.fetch.mockClear();
  });

  ['me', 'users', 'tenants'].forEach((key) => {
    it(`matches ${key} `, async () => {
      const headersArray: { key: string; value: string }[] = [];
      let params: Request = {} as Request;

      const req = {
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
        { key: 'x-niledb-creds', value: 'undefined:undefined' },
        { key: 'x-niledb-origin', value: 'http://localhost:3001' },
      ]);
    });
  });
});
