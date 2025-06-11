import { Server } from '../../Server';
import { Config } from '../../utils/Config';
import { TENANT_COOKIE } from '../../utils/constants';

export function bindHandleOnRequest(instance: Server) {
  return async function handleOnRequest(
    config: Config,
    _init: RequestInit & { request: Request },
    params: RequestInit
  ) {
    const { debug } = config.logger('[EXTENSIONS]');
    if (config.extensions) {
      for (const create of config.extensions) {
        if (typeof create !== 'function') {
          return undefined;
        }
        const ext = await create(instance);
        if (ext.onRequest) {
          await ext.onRequest(_init.request);
          const updatedContext = instance.getContext();
          if (updatedContext?.headers) {
            const cookie = updatedContext.headers.get('cookie');
            if (cookie) {
              (params.headers as Headers).set('cookie', cookie);
            }

            if (updatedContext.tenantId) {
              (params.headers as Headers).set(
                TENANT_COOKIE,
                String(updatedContext.headers.get(TENANT_COOKIE))
              );
            }
          }
          debug(`${ext.id ?? create.name} ran onRequest`);
        }
      }
    }
  };
}

export function buildExtensionConfig(instance: Server) {
  return {
    handleOnRequest: bindHandleOnRequest(instance),
  };
}
