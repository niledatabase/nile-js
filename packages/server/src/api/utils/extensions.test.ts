import { Extension, ExtensionState } from '../../types';
import { TENANT_COOKIE } from '../../utils/constants';
import { Server } from '../../Server';
import { Config } from '../../utils/Config';

import { bindRunExtensions, buildExtensionConfig } from './extensions';
import { ctx } from './request-context';

const createMockServer = (): Server => {
  let context: Record<string, unknown> = {};
  return {
    getContext: jest.fn(() => context),
    setContext: jest.fn((ctx) => {
      context = { ...context, ...ctx };
    }),
  } as unknown as Server;
};

describe('bindHandleOnRequest', () => {
  let mockServer: ReturnType<typeof createMockServer>;
  let config: Config;
  let params: { headers: Headers };
  const mockDebug = jest.fn();
  beforeEach(() => {
    mockServer = createMockServer();

    config = new Config({
      logger: () => ({
        debug: mockDebug,
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        silly: jest.fn(),
      }),
      extensions: [],
    });

    params = {
      headers: new Headers(),
    };
  });

  it('does nothing when there are no extensions', async () => {
    const handler = bindRunExtensions(mockServer);
    await handler(ExtensionState.onRequest, config, params, {
      request: new Request('http://test'),
    });
    expect(config.logger().debug).not.toHaveBeenCalled();
  });

  it('ignores non-function extensions', async () => {
    config.extensions = ['not a function' as unknown as Extension];
    const handler = bindRunExtensions(mockServer);
    await handler(ExtensionState.onRequest, config, params, {
      request: new Request('http://test'),
    });
    expect(config.logger().debug).not.toHaveBeenCalled();
  });

  it('runs valid extensions with onRequest', async () => {
    await ctx.run({}, async () => {
      const ext = {
        id: 'mock-extension',
        onRequest: jest.fn(async (_request, ctx) => {
          ctx.set({
            headers: new Headers({
              cookie: 'foo=bar',
              [TENANT_COOKIE]: 'abc123',
            }),
            tenantId: 'abc123',
          });
        }),
      };

      config.extensions = [jest.fn(() => ext) as unknown as Extension];

      const handler = bindRunExtensions(mockServer);

      const params = {
        headers: new Headers(),
      };

      await handler(ExtensionState.onRequest, config, [params], {
        request: new Request('http://test'),
      });

      expect(ext.onRequest).toHaveBeenCalled();

      const [calledRequest, calledCtx] = ext.onRequest.mock.calls[0];

      expect(calledRequest).toBeInstanceOf(Request);
      expect(typeof calledCtx.get).toBe('function');

      const updatedContext = calledCtx.get();
      expect(updatedContext.headers.get('cookie')).toEqual('foo=bar');
      expect(updatedContext.tenantId).toBe('abc123');
      expect(params.headers.get('cookie')).toBe('foo=bar');
      expect(params.headers.get(TENANT_COOKIE)).toBe('abc123');

      expect(mockDebug).toHaveBeenCalledWith('mock-extension ran onRequest');
    });
  });

  it('preserves previous cookies if preserveHeaders is true', async () => {
    const previousContext = {
      preserveHeaders: true,
      headers: new Headers({ cookie: 'session=123' }),
      userId: null,
      tenantId: null,
    };

    const updatedContext = {
      headers: new Headers({ cookie: 'auth=456' }),
    };

    await ctx.run({ ...previousContext }, async () => {
      const ext = {
        id: 'mock-extension',
        onRequest: jest.fn(async (_request, ctx) => {
          ctx.set(updatedContext);
        }),
      };

      config.extensions = [jest.fn(() => ext) as unknown as Extension];

      const handler = bindRunExtensions(mockServer);
      const params = { headers: new Headers() };

      await handler(ExtensionState.onRequest, config, [params], {
        request: new Request('http://test'),
      });

      // ✅ merged result of previousContext + updatedContext
      expect(params.headers.get('cookie')).toBe('session=123; auth=456');
    });
  });
});

describe('buildExtensionConfig', () => {
  it('returns an object with handleOnRequest bound to the instance', () => {
    const mockServer = createMockServer();
    const config = buildExtensionConfig(mockServer);
    expect(typeof config.runExtensions).toBe('function');
  });
});
