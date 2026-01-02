import { Config } from '../../utils/Config';
import { ExtensionState } from '../../types';

import { ctx, withNileContext } from './request-context';

describe('withNileContext', () => {
  it('applies extension overrides before running callback', async () => {
    const runExtensionsMock = jest.fn(async (state: ExtensionState) => {
      if (state === ExtensionState.withContext) {
        ctx.set({
          headers: new Headers({ cookie: 'foo=bar' }),
          tenantId: 'ext-tenant',
        });
      }
    });

    const config = {
      context: {
        headers: new Headers(),
        tenantId: undefined,
        userId: undefined,
      },
      extensions: [jest.fn()],
      extensionCtx: { runExtensions: runExtensionsMock },
    } as unknown as Config;

    await ctx.run({ headers: new Headers() }, async () => {
      await withNileContext(config, async () => {
        const active = ctx.get();
        expect(active.headers.get('cookie')).toBe('foo=bar');
        expect(active.tenantId).toBe('ext-tenant');
      });
    });

    const withContextCalls = runExtensionsMock.mock.calls.filter(
      ([state]) => state === ExtensionState.withContext
    );
    expect(withContextCalls).toHaveLength(1);
  });
});
