/* eslint-disable @typescript-eslint/ban-ts-comment */
import Nile from '..';
import { LoginInfo } from '../generated/openapi/src/models/LoginInfo';

const userPayload = {
  id: 4,
  email: 'bob@squarepants.com',
};
describe('index', () => {
  describe('login', () => {
    let payload: LoginInfo;
    beforeEach(() => {
      payload = { email: userPayload.email, password: 'super secret' };
      // @ts-expect-error
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ rates: { CAD: 1.42 } }),
        })
      );
    });
    afterEach(() => {
      // @ts-expect-error
      fetch.mockClear();
    });

    it('works', async () => {
      // @ts-expect-error
      fetch.mockImplementation(() => ({
        status: 200,
        json: () => Promise.resolve({ token: 123 }),
      }));
      const nile = Nile();
      await nile.login({ loginInfo: payload });
      expect(nile.authToken).toBeTruthy();
    });

    it('does not work', async () => {
      // @ts-expect-error
      fetch.mockImplementation(() => ({
        status: 200,
        json: () => Promise.resolve({}),
      }));
      const nile = Nile();
      await nile.login({ loginInfo: payload });

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
      }));
      const nile = Nile();
      await nile.login({ loginInfo: payload }, { signal: controller.signal });
      controller.abort();
      expect(abortSpy).toBeCalled();
      expect(json).not.toBeCalled();
      expect(nile.authToken).toBeFalsy();
    });
  });
});
