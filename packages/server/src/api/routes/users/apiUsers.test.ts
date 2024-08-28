import { X_NILE_TENANT } from '../../../utils/fetch';
import fetch from '../../utils/request';
import { Config } from '../../../utils/Config';

import route from '.';

const utilRequest = fetch as jest.Mock;

jest.mock('../../utils/request', () => jest.fn());
jest.mock('../../utils/auth', () => () => 'a session, relax');

describe('users route', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should 404 on GET users without a tenant id', async () => {
    const _res = new Request('http://thenile.dev', { method: 'GET' });
    const res = await route(
      _res,
      new Config({
        api: { basePath: 'http://thenile.dev/v2/databases/testdb' },
      })
    );
    expect(res?.status).toEqual(404);
    expect(utilRequest).not.toHaveBeenCalled();
  });
  it('should post to v2 users', async () => {
    const _res = new Request('http://thenile.dev', { method: 'POST' });
    await route(
      _res,
      new Config({
        api: { basePath: 'http://thenile.dev/v2/databases/testdb' },
      })
    );
    expect(utilRequest).toHaveBeenCalledWith(
      'http://thenile.dev/v2/databases/testdb/users',
      expect.objectContaining({ method: 'POST' })
    );
  });
  it('should GET to v2 tenant users with params', async () => {
    const _res = new Request('http://localhost:3000?tenantId=123', {});
    await route(
      _res,
      new Config({
        api: { basePath: 'http://thenile.dev/v2/databases/testdb' },
      })
    );
    expect(utilRequest).toHaveBeenCalledWith(
      'http://thenile.dev/v2/databases/testdb/tenants/123/users',
      expect.objectContaining({ method: 'GET' })
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
        api: { basePath: 'http://thenile.dev/v2/databases/testdb' },
      })
    );
    expect(utilRequest).toHaveBeenCalledWith(
      'http://thenile.dev/v2/databases/testdb/tenants/123/users',
      expect.objectContaining({ method: 'GET' })
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
        api: { basePath: 'http://thenile.dev/v2/databases/testdb' },
      })
    );
    expect(utilRequest).toHaveBeenCalledWith(
      'http://thenile.dev/v2/databases/testdb/tenants/456/users',
      expect.objectContaining({ method: 'GET' })
    );
  });
});
