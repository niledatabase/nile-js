import { fetchTenantUsers } from '../api/routes/tenants/[tenantId]/users';
import { fetchTenantUser } from '../api/routes/tenants/[tenantId]/users/[userId]';
import { fetchMe } from '../api/routes/me';
import { Config } from '../utils/Config';

import Tenants from '.';

jest.mock('../api/routes/tenants');
jest.mock('../api/routes/tenants/[tenantId]/users');
jest.mock('../api/routes/tenants/[tenantId]/users/[userId]');
jest.mock('../api/routes/me');

const mockJson = jest.fn();
const mockClone = jest.fn(() => ({ json: mockJson }));

const mockResponse = {
  clone: mockClone,
  status: 200,
  ok: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockJson.mockResolvedValue({ id: 't1', name: 'Tenant 1' });
});

const config = { apiUrl: 'https://api.example.com', headers: {} };

describe('Tenants class', () => {
  describe('leaveTenant()', () => {
    it('calls fetchTenantUser after getting user from fetchMe', async () => {
      (fetchMe as jest.Mock).mockResolvedValue({
        json: async () => ({ id: 'u1' }),
      });
      (fetchTenantUser as jest.Mock).mockResolvedValue(mockResponse);

      const tenants = new Tenants(new Config(config));
      const result = await tenants.leaveTenant('t1');

      expect(fetchMe).toHaveBeenCalled();
      expect(fetchTenantUser).toHaveBeenCalledWith(expect.anything(), 'DELETE');
      expect(result).toEqual(mockResponse);
    });

    it('handles missing user in fetchMe gracefully', async () => {
      (fetchMe as jest.Mock).mockResolvedValue({
        json: async () => {
          throw new Error('failed');
        },
      });
      (fetchTenantUser as jest.Mock).mockResolvedValue(mockResponse);

      const tenants = new Tenants(new Config(config));
      const result = await tenants.leaveTenant({ tenantId: 't1' });

      expect(fetchTenantUser).toHaveBeenCalledWith(expect.anything(), 'DELETE');
      expect(result).toEqual(mockResponse);
    });

    it('returns raw response if json parsing fails', async () => {
      const resWithFailingJson = {
        clone: () => ({
          json: () => {
            throw new Error('fail');
          },
        }),
      };
      (fetchMe as jest.Mock).mockResolvedValue({
        json: async () => ({ id: 'u1' }),
      });
      (fetchTenantUser as jest.Mock).mockResolvedValue(resWithFailingJson);

      const tenants = new Tenants(new Config(config));
      const result = await tenants.leaveTenant('t1');

      expect(result).toEqual(resWithFailingJson);
    });
  });

  describe('addMember()', () => {
    it('adds user by string userId', async () => {
      (fetchTenantUser as jest.Mock).mockResolvedValue(mockResponse);

      const tenants = new Tenants(new Config(config));
      const result = await tenants.addMember('u1');

      expect(fetchTenantUser).toHaveBeenCalledWith(expect.anything(), 'PUT');
      expect(result).toEqual({ id: 't1', name: 'Tenant 1' });
    });

    it('adds user with context object', async () => {
      (fetchTenantUser as jest.Mock).mockResolvedValue(mockResponse);

      const tenants = new Tenants(new Config(config));
      const result = await tenants.addMember({ userId: 'u1', tenantId: 't2' });

      expect(fetchTenantUser).toHaveBeenCalledWith(expect.anything(), 'PUT');
      expect(result).toEqual({ id: 't1', name: 'Tenant 1' });
    });

    it('returns raw response when requested', async () => {
      (fetchTenantUser as jest.Mock).mockResolvedValue(mockResponse);

      const tenants = new Tenants(new Config(config));
      const result = await tenants.addMember('u1', true);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeMember()', () => {
    it('removes user using userId', async () => {
      (fetchTenantUser as jest.Mock).mockResolvedValue(mockResponse);

      const tenants = new Tenants(new Config(config));
      const result = await tenants.removeMember('u1');

      expect(fetchTenantUser).toHaveBeenCalledWith(expect.anything(), 'DELETE');
      expect(result).toEqual({ id: 't1', name: 'Tenant 1' });
    });

    it('removes user using context object', async () => {
      (fetchTenantUser as jest.Mock).mockResolvedValue(mockResponse);

      const tenants = new Tenants(new Config(config));
      const result = await tenants.removeMember({
        userId: 'u1',
        tenantId: 't1',
      });

      expect(fetchTenantUser).toHaveBeenCalledWith(expect.anything(), 'DELETE');
      expect(result).toEqual({ id: 't1', name: 'Tenant 1' });
    });
  });

  describe('users()', () => {
    it('returns parsed user list', async () => {
      mockJson.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
      (fetchTenantUsers as jest.Mock).mockResolvedValue(mockResponse);

      const tenants = new Tenants(new Config(config));
      const result = await tenants.users();

      expect(fetchTenantUsers).toHaveBeenCalledWith(expect.anything(), 'GET');
      expect(result).toEqual([{ id: 'u1' }, { id: 'u2' }]);
    });

    it('returns raw response when requested', async () => {
      (fetchTenantUsers as jest.Mock).mockResolvedValue(mockResponse);

      const tenants = new Tenants(new Config(config));
      const result = await tenants.users(true);

      expect(result).toEqual(mockResponse);
    });

    it('returns raw response if json() throws', async () => {
      const errorResponse = {
        clone: () => ({
          json: () => {
            throw new Error('fail');
          },
        }),
      };
      (fetchTenantUsers as jest.Mock).mockResolvedValue(errorResponse);

      const tenants = new Tenants(new Config(config));
      const result = await tenants.users();

      expect(result).toEqual(errorResponse);
    });
  });
});
