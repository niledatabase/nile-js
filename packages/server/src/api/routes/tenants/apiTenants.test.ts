import { Config } from '../../../utils/Config';
import { X_NILE_TENANT } from '../../../utils/constants';
import fetch from '../../utils/request';

import route from '.';

const utilRequest = fetch as jest.Mock;

jest.mock('../../utils/request', () => jest.fn());
jest.mock('../../utils/auth', () => () => ({
  id: 'something',
}));

describe('tenants route', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should post to v2 tenants', async () => {
    const _res = new Request('http://thenile.dev?tenantId=123', {
      method: 'POST',
    });
    await route(
      _res,
      new Config({
        apiUrl: 'http://thenile.dev/v2/databases/testdb',
      })
    );
    expect(utilRequest).toHaveBeenCalledWith(
      'http://thenile.dev/v2/databases/testdb/tenants',
      expect.objectContaining({ method: 'POST' }),
      expect.objectContaining({})
    );
  });
  it('should GET to v2 tenant users with params', async () => {
    const _res = new Request('http://localhost:3000/users/${userId}/tenants', {
      method: 'GET',
    });
    await route(
      _res,
      new Config({
        apiUrl: 'http://thenile.dev/v2/databases/testdb',
      })
    );

    expect(utilRequest.mock.calls[0][0]).toEqual(
      'http://thenile.dev/v2/databases/testdb/users/something/tenants'
    );
  });
  it('should GET to v2 tenant users with headers', async () => {
    const _res = new Request('http://localhost:3000', {
      headers: new Headers({
        [X_NILE_TENANT]: '123',
      }),
    });
    await route(
      _res,
      new Config({
        apiUrl: 'http://thenile.dev/v2/databases/testdb',
      })
    );
    expect(utilRequest.mock.calls[0][0]).toEqual(
      'http://thenile.dev/v2/databases/testdb/users/something/tenants'
    );
  });
  it('should GET to v2 tenant users with cookies', async () => {
    const _res = new Request('http://localhost:3000', {
      headers: new Headers({
        cookie: `token=abunchofgarbage; ${X_NILE_TENANT}=456`,
      }),
    });
    await route(
      _res,
      new Config({
        apiUrl: 'http://thenile.dev/v2/databases/testdb',
      })
    );
    expect(utilRequest.mock.calls[0][0]).toEqual(
      'http://thenile.dev/v2/databases/testdb/users/something/tenants'
    );
  });
});
