import { TENANT_COOKIE } from '../../../utils/constants';
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
        apiUrl: 'http://thenile.dev/v2/databases/testdb',
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
        apiUrl: 'http://thenile.dev/v2/databases/testdb',
      })
    );
    expect(utilRequest).toHaveBeenCalledWith(
      'http://thenile.dev/v2/databases/testdb/users',
      expect.objectContaining({ method: 'POST' }),
      expect.objectContaining({})
    );
  });

  it('should post to v2 users with tenantId and newTenantName', async () => {
    const _res = new Request(
      'http://thenile.dev?tenantId=123&newTenantName=456',
      { method: 'POST' }
    );
    await route(
      _res,
      new Config({
        apiUrl: 'http://thenile.dev/v2/databases/testdb',
      })
    );
    expect(utilRequest).toHaveBeenCalledWith(
      'http://thenile.dev/v2/databases/testdb/users?tenantId=123&newTenantName=456',
      expect.objectContaining({ method: 'POST' }),
      expect.objectContaining({})
    );
  });
  it('should GET to v2 tenant users with params', async () => {
    const _res = new Request('http://localhost:3000?tenantId=123', {});
    await route(
      _res,
      new Config({
        apiUrl: 'http://thenile.dev/v2/databases/testdb',
      })
    );
    expect(utilRequest).toHaveBeenCalledWith(
      'http://thenile.dev/v2/databases/testdb/tenants/123/users',
      expect.objectContaining({ method: 'GET' }),
      expect.objectContaining({})
    );
  });
  it('should GET to v2 tenant users with cookies', async () => {
    const _res = new Request('http://localhost:3000', {
      headers: new Headers({
        cookie: `token=abunchofgarbage; ${TENANT_COOKIE}=456`,
      }),
    });
    await route(
      _res,
      new Config({
        apiUrl: 'http://thenile.dev/v2/databases/testdb',
      })
    );
    expect(utilRequest).toHaveBeenCalledWith(
      'http://thenile.dev/v2/databases/testdb/tenants/456/users',
      expect.objectContaining({ method: 'GET' }),
      expect.objectContaining({})
    );
  });
});
