import { Server } from '@niledatabase/server';

import { expressPaths } from '.';

describe('express', () => {
  it('cleans express paths', () => {
    const nile = new Server({
      apiUrl: 'http://localhost:3000',
      user: '123',
      password: '123',
      databaseName: '123',
    });
    const { paths } = expressPaths(nile);
    expect(Object.keys(paths)).toEqual(['get', 'post', 'put', 'delete']);
    expect(paths.delete).toEqual([
      '/api/tenants/:tenantId/users/:userId',
      '/api/tenants/:tenantId',
    ]);
    expect(paths.post).toEqual([
      '/api/tenants/:tenantId/users',
      '/api/signup',
      '/api/users',
      '/api/tenants',
      '/api/auth/session',
      '/api/auth/signin/:provider',
      '/api/auth/reset-password',
      '/api/auth/providers',
      '/api/auth/csrf',
      '/api/auth/callback/:provider',
      '/api/auth/signout',
    ]);
    expect(paths.put).toEqual([
      '/api/tenants/:tenantId/users',
      '/api/users',
      '/api/tenants/:tenantId',
      '/api/auth/reset-password',
    ]);
    expect(paths.get).toEqual([
      '/api/me',
      '/api/tenants/:tenantId/users',
      '/api/tenants',
      '/api/tenants/:tenantId',
      '/api/auth/session',
      '/api/auth/signin',
      '/api/auth/providers',
      '/api/auth/csrf',
      '/api/auth/reset-password',
      '/api/auth/callback',
      '/api/auth/signout',
      '/api/auth/verify-request',
      '/api/auth/error',
    ]);
  });
});
