import { Extension, ExtensionState } from '../../types';
import { TENANT_COOKIE } from '../../utils/constants';
import { Server } from '../../Server';
import { Config } from '../../utils/Config';

import { bindRunExtensions, buildExtensionConfig } from './extensions';

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
    const ext = {
      id: 'mock-extension',
      onRequest: jest.fn(async () => {
        mockServer.setContext({
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
    await handler(ExtensionState.onRequest, config, params, {
      request: new Request('http://test'),
    });

    expect(ext.onRequest).toHaveBeenCalled();
    expect(params.headers?.get('cookie')).toBe('foo=bar');
    expect(params.headers?.get(TENANT_COOKIE)).toBe('abc123');
    expect(mockDebug).toHaveBeenCalledWith('mock-extension ran onRequest');
  });

  it('preserves previous cookies if preserveHeaders is true', async () => {
    const previousContext = {
      preserveHeaders: true,
      headers: new Headers({ cookie: 'session=123' }),
      userId: null,
      tenantId: null,
    };

    // Second call to getContext (after ext.onRequest)
    const updatedContext = {
      headers: new Headers({ cookie: 'auth=456' }),
    };

    mockServer.getContext = jest
      .fn()
      .mockImplementationOnce(() => previousContext)
      .mockImplementationOnce(() => updatedContext);

    const ext = {
      onRequest: jest.fn(async () => {
        mockServer.setContext(updatedContext);
      }),
    };

    config.extensions = [jest.fn(() => ext) as unknown as Extension];

    const handler = bindRunExtensions(mockServer);
    await handler(ExtensionState.onRequest, config, params, {
      request: new Request('http://test'),
    });

    expect(params.headers?.get('cookie')).toBe('session=123; auth=456');
  });
});

describe('buildExtensionConfig', () => {
  it('returns an object with handleOnRequest bound to the instance', () => {
    const mockServer = createMockServer();
    const config = buildExtensionConfig(mockServer);
    expect(typeof config.runExtensions).toBe('function');
  });
});
