import { Config } from '../../../utils/Config';
import { X_NILE_TENANT } from '../../../utils/fetch';
import fetch from '../../utils/request';
import auth from '../../utils/auth';

import route from '.';

const utilRequest = fetch as jest.Mock;
const auther = auth as jest.Mock;

jest.mock('../../utils/request', () => jest.fn());
jest.mock('./auth', () => jest.fn());

describe('tenants route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  fit('should 404 on GET without a user id', async () => {
    const _res = new Request('http://thenile.dev', { method: 'get' });
    auther.mockResolvedValueOnce({ id: 'yesser' });
    const res = await route(_res, new Config());
    expect(res?.status).toEqual(404);
    expect(utilRequest).not.toHaveBeenCalled();
  });
  it('should post to v2 tenants', async () => {
    const _res = new Request('http://thenile.dev?tenantId=123', {
      method: 'POST',
    });
    await route(_res, new Config());
    expect(utilRequest).toHaveBeenCalledWith(
      'http://thenile.dev/v2/databases/testdb/tenants',
      expect.objectContaining({ method: 'POST' })
    );
  });
  it('should GET to v2 tenant users with params', async () => {
    const _res = new Request('http://localhost:3000?tenantId=123', {});
    await route(_res, new Config());
    expect(utilRequest).toHaveBeenCalledWith(
      'http://thenile.dev/v2/databases/testdb/tenants/123',
      expect.objectContaining({ method: 'GET' })
    );
  });
  it('should GET to v2 tenant users with headers', async () => {
    const _res = new Request('http://localhost:3000', {
      headers: new Headers({
        [X_NILE_TENANT]: '123',
      }),
    });
    await route(_res, new Config());
    expect(utilRequest).toHaveBeenCalledWith(
      'http://thenile.dev/v2/databases/testdb/tenants/123/users/234/tenants',
      expect.objectContaining({ method: 'GET' })
    );
  });
  it('should GET to v2 tenant users with cookies', async () => {
    const _res = new Request('http://localhost:3000', {
      headers: new Headers({
        cookie: `token=abunchofgarbage; ${X_NILE_TENANT}=456`,
      }),
    });
    await route(_res, new Config());
    expect(utilRequest).toHaveBeenCalledWith(
      'http://thenile.dev/v2/databases/testdb/tenants/456/users',
      expect.objectContaining({ method: 'GET' })
    );
  });
});
