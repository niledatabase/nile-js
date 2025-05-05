import { fetchMe } from '../api/routes/me';
import { updateHeaders } from '../utils/Event';
import { Config } from '../utils/Config';

import Users from '.';

jest.mock('../api/routes/me', () => ({
  fetchMe: jest.fn(),
}));
jest.mock('../utils/Event', () => ({
  updateHeaders: jest.fn(),
}));

const mockJson = jest.fn();
const mockClone = jest.fn(() => ({ json: mockJson }));

const mockResponse = {
  clone: mockClone,
  status: 200,
  ok: true,
};

const config = { apiUrl: 'https://api.example.com', headers: {} };

beforeEach(() => {
  jest.clearAllMocks();
  mockJson.mockResolvedValue({ id: 'u1', name: 'User 1' });
});

describe('Users class', () => {
  describe('updateSelf()', () => {
    it('updates self and returns parsed response', async () => {
      (fetchMe as jest.Mock).mockResolvedValue(mockResponse);

      const cfg = new Config(config);
      const users = new Users(cfg);
      const result = await users.updateSelf({ name: 'Updated User' });

      expect(fetchMe).toHaveBeenCalledWith(
        cfg,
        'PUT',
        JSON.stringify({ name: 'Updated User' })
      );
      expect(result).toEqual({ id: 'u1', name: 'User 1' });
    });

    it('returns raw response when rawResponse is true', async () => {
      (fetchMe as jest.Mock).mockResolvedValue(mockResponse);

      const users = new Users(new Config(config));
      const result = await users.updateSelf({ name: 'Updated' }, true);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeSelf()', () => {
    it('removes self and sets userId from getSelf result', async () => {
      const mockUser = { id: 'user-123' };
      const mockRes = {
        clone: () => ({ json: jest.fn().mockResolvedValue(mockUser) }),
      };
      (fetchMe as jest.Mock).mockResolvedValueOnce(mockRes); // getSelf
      (fetchMe as jest.Mock).mockResolvedValueOnce(mockResponse); // DELETE

      const cfg = new Config(config);
      const users = new Users(cfg);
      const result = await users.removeSelf();

      expect(fetchMe).toHaveBeenNthCalledWith(1, cfg); // getSelf
      expect(fetchMe).toHaveBeenNthCalledWith(2, cfg, 'DELETE');
      expect(updateHeaders).toHaveBeenCalledWith(expect.any(Headers));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSelf()', () => {
    it('gets self and returns parsed response', async () => {
      (fetchMe as jest.Mock).mockResolvedValue(mockResponse);

      const users = new Users(new Config(config));
      const result = await users.getSelf();

      expect(fetchMe).toHaveBeenCalledWith(expect.any(Config));
      expect(result).toEqual({ id: 'u1', name: 'User 1' });
    });

    it('returns raw response when rawResponse is true', async () => {
      (fetchMe as jest.Mock).mockResolvedValue(mockResponse);

      const users = new Users(new Config(config));
      const result = await users.getSelf(true);

      expect(result).toEqual(mockResponse);
    });
  });
});
