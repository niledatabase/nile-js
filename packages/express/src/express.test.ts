import { ExtensionState, Server } from '@niledatabase/server';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
  Express,
} from 'express';

import { express as expressExtension, cleaner } from '.';

describe('express extension', () => {
  let instance: Server;
  let mockApp: Express;

  beforeEach(() => {
    mockApp = {
      use: jest.fn(),
      param: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as Express;

    instance = {
      logger: () => ({
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
      }),
      handlers: {
        GET: jest
          .fn()
          .mockResolvedValue(
            new Response(JSON.stringify({ msg: 'GET OK' }), { status: 200 })
          ),
        POST: jest
          .fn()
          .mockResolvedValue(
            new Response(JSON.stringify({ msg: 'POST OK' }), { status: 201 })
          ),
        PUT: jest
          .fn()
          .mockResolvedValue(
            new Response(JSON.stringify({ msg: 'PUT OK' }), { status: 201 })
          ),
        DELETE: jest
          .fn()
          .mockResolvedValue(
            new Response(JSON.stringify({ msg: 'DELET OK' }), { status: 201 })
          ),
      },
      withContext: jest.fn((context, fn) => {
        // Simulate calling the callback with the mocked instance itself
        return fn(instance);
      }),
      paths: {
        get: ['/test/{id}'],
        post: ['/submit/{formId}'],
        put: [],
        delete: [],
      },
    } as unknown as Server;
  });

  describe('cleaner()', () => {
    it('replaces {param} with :param', () => {
      expect(cleaner('/api/{tenantId}/resource')).toBe(
        '/api/:tenantId/resource'
      );
    });
  });

  describe('onConfigure', () => {
    it('cleans up path params and updates instance.paths', () => {
      const ext = expressExtension(mockApp)();
      ext.onConfigure?.(instance);
      expect(instance.paths).toEqual({
        get: ['/test/:id'],
        post: ['/submit/:formId'],
        put: [],
        delete: [],
      });
    });
  });

  describe('onHandleRequest', () => {
    it('proxies GET request with JSON response', async () => {
      const ext = expressExtension(mockApp)();
      ext.onConfigure?.(instance); // must configure to set instance

      const req = {
        method: 'GET',
        protocol: 'http',
        get: () => 'localhost',
        originalUrl: '/api/test',
        headers: { cookie: 'a=b' },
        body: {},
      } as unknown as ExpressRequest;
      const res = {
        headersSent: false,
        status: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      } as unknown as ExpressResponse;

      const result = await ext.onHandleRequest?.([req, res, jest.fn()]);

      expect(instance.handlers.GET).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ msg: 'GET OK' });
      expect(result).toBe(ExtensionState.onHandleRequest);
    });

    it('handles non-JSON response fallback', async () => {
      (instance.handlers.GET as jest.Mock).mockResolvedValue(
        new Response('Plain text body', { status: 200 })
      );
      const ext = expressExtension(mockApp)();
      ext.onConfigure?.(instance);

      const req = {
        method: 'GET',
        protocol: 'http',
        get: () => 'localhost',
        originalUrl: '/api/test',
        headers: {},
        body: {},
      } as unknown as ExpressRequest;
      const res = {
        headersSent: false,
        status: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      } as unknown as ExpressResponse;

      await ext.onHandleRequest?.([req, res, jest.fn()]);

      expect(res.send).toHaveBeenCalledWith('Plain text body');
    });

    it('does not re-send headers if already sent', async () => {
      const ext = expressExtension(mockApp)();
      ext.onConfigure?.(instance);

      const req = {
        method: 'GET',
        protocol: 'http',
        get: () => 'localhost',
        originalUrl: '/api/test',
        headers: {},
        body: {},
      } as unknown as ExpressRequest;
      const res = {
        headersSent: true,
        status: jest.fn(),
        set: jest.fn(),
        json: jest.fn(),
        send: jest.fn(),
      } as unknown as ExpressResponse;

      const result = await ext.onHandleRequest?.([req, res, jest.fn()]);

      expect(res.status).not.toHaveBeenCalled();
      expect(result).toBe(ExtensionState.onHandleRequest);
    });
  });
});
