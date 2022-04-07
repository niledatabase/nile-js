/* eslint-disable @typescript-eslint/ban-ts-comment */
import Nile from '..';
import { LoginInfo } from '../generated/openapi/models/LoginInfo';
import { IsomorphicFetchHttpLibrary } from '../generated/openapi/http/isomorphic-fetch';

const userPayload = {
  id: 4,
  email: 'bob@squarepants.com',
};
jest.mock('../generated/openapi/http/isomorphic-fetch');
jest.mock('../generated/openapi/http/http', () => {
  return {
    RequestContext: class RequestContext {
      private body: unknown
      private headers: { [key: string]: string } = {};
      constructor() {
        // do nothing
      }

      public setHeaderParam(key: string, value: string): void {
        this.headers[key] = value;
      }
      public setBody(body: unknown) { return this.body = body }
      public getBody() { return this.body }
      public getUrl() { return null }
      public getHeaders() { return {} }
      public getHttpMethod() { return 'GET' }
    },
    HttpMethod: {
      GET: 'GET',
      HEAD: 'HEAD',
      POST: 'POST',
      PUT: 'PUT',
      DELETE: 'DELETE',
      CONNECT: 'CONNECT',
      OPTIONS: 'OPTIONS',
      TRACE: 'TRACE',
      PATCH: 'PATCH'
    }
  }
});

describe('index', () => {
  describe('login', () => {
    let payload:LoginInfo;
    beforeEach(() => {
      payload = { email: userPayload.email, password: 'super secret' };
      // @ts-expect-error
      IsomorphicFetchHttpLibrary.mockReset();
    });

    it('works', async () => {
      // @ts-expect-error
      IsomorphicFetchHttpLibrary.mockImplementation(() => {
        return {
          send: () => {
            return {
              toPromise: () => {
                return {
                  httpStatusCode: 200, headers: { 'content-type': 'application/json' }, body: {
                    text: () => {
                      return JSON.stringify({ token: 'password123' });
                    }
                  }
                }
              }
            }
          }
        }
      });
      const nile = Nile();
      await nile.login(payload);
      expect(nile.authToken).not.toBeNull();
    });

    it('does not work', async () => {
      // @ts-expect-error
      IsomorphicFetchHttpLibrary.mockImplementation(() => {
        return {
          send: () => {
            return {
              toPromise: () => {
                return {
                  httpStatusCode: 200, headers: { 'content-type': 'application/json' }, body: {
                    text: () => {
                      return JSON.stringify({});
                    }
                  }
                }
              }
            }
          }
        }
      });

      const nile = Nile();

      await nile.login(payload);
      expect(nile.authToken).toBeFalsy();
    });

  });
});
