import { Server } from '../../Server';
import { Config } from '../../utils/Config';

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
          const modified = await ext.onRequest(_init.request);
          if (modified?.headers) {
            const modHeaders = new Headers(modified.headers);
            const cookie = modHeaders.get('cookie');
            if (cookie) {
              (params.headers as Headers).set('cookie', cookie);
              debug(`${ext.id ?? create.name} modified cookie`);
            }
          }
        }
        debug(`${ext.id ?? create.name} ran onRequest`);
      }
    }
  };
}

export function buildExtensionConfig(instance: Server) {
  return {
    handleOnRequest: bindHandleOnRequest(instance),
  };
}
