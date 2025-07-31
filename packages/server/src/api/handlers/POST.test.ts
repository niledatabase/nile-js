import {
  appRoutes,
  DefaultNileAuthRoutes,
  NileAuthRoutes,
} from '../utils/routes';
import { Config } from '../../utils/Config';
import { HEADER_ORIGIN, HEADER_SECURE_COOKIES } from '../../utils/constants';

import POSTER from './POST';

jest.mock('../utils/auth', () => () => 'a session, relax');
describe('poster', () => {
  const apiGet = POSTER(
    appRoutes(),
    new Config({ apiUrl: 'http://thenile.dev/v2/databases/testdb' })
  );
  (global.fetch as jest.Mock) = jest.fn();

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  [...Object.values(NileAuthRoutes), ...Object.values(DefaultNileAuthRoutes)]
    .filter(
      (str) =>
        str !== DefaultNileAuthRoutes.USER_TENANTS &&
        str !== DefaultNileAuthRoutes.USERS &&
        str !== DefaultNileAuthRoutes.USER &&
        str !== DefaultNileAuthRoutes.ME
    )
    .forEach((key) => {
      it(`matches ${key} `, async () => {
        const headersArray: { key: string; value: string }[] = [];
        let params: Request = {} as Request;

        const init = {
          method: 'POST',
          headers: new Headers({
            host: 'http://localhost:3000',
          }),
        };
        const url = `http://localhost:3001/api${key}`;

        //@ts-expect-error - fetch
        global.fetch = jest.fn((url, p) => {
          if (p) {
            params = new Request(url, p);
          }
          return Promise.resolve({ status: 200 });
        });

        const fn = await apiGet(new Request(url, init));

        expect(fn).toBeTruthy();
        expect((fn as Response)?.status).toEqual(200);
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
