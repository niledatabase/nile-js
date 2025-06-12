import { Extension } from '../../types';
import { TENANT_COOKIE } from '../../utils/constants';
import { Server } from '../../Server';
import { Config } from '../../utils/Config';

import { bindHandleOnRequest, buildExtensionConfig } from './extensions';

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
    const handler = bindHandleOnRequest(mockServer);
    await handler(config, { request: new Request('http://test') }, params);
    expect(config.logger().debug).not.toHaveBeenCalled();
  });

  it('ignores non-function extensions', async () => {
    config.extensions = ['not a function' as unknown as Extension];
    const handler = bindHandleOnRequest(mockServer);
    await handler(config, { request: new Request('http://test') }, params);
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

    config.extensions = [jest.fn(() => Promise.resolve(ext))];

    const handler = bindHandleOnRequest(mockServer);
    await handler(config, { request: new Request('http://test') }, params);

    expect(ext.onRequest).toHaveBeenCalled();
    expect(params.headers?.get('cookie')).toBe('foo=bar');
    expect(params.headers?.get(TENANT_COOKIE)).toBe('abc123');
    expect(mockDebug).toHaveBeenCalledWith('mock-extension ran onRequest');
  });

  fit('preserves previous cookies if preserveHeaders is true', async () => {
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

    config.extensions = [jest.fn(() => Promise.resolve(ext))];

    const handler = bindHandleOnRequest(mockServer);
    await handler(config, { request: new Request('http://test') }, params);

    expect(params.headers?.get('cookie')).toBe('session=123; auth=456');
  });
});

describe('buildExtensionConfig', () => {
  it('returns an object with handleOnRequest bound to the instance', () => {
    const mockServer = createMockServer();
    const config = buildExtensionConfig(mockServer);
    expect(typeof config.handleOnRequest).toBe('function');
  });
});
