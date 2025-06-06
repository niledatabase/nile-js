import { Server } from '@niledatabase/server/Server';

import { Config } from '../../utils/Config';

export function bindHandleOnRequest(instance: Server) {
  return async function handleOnRequest(
    config: Config,
    _init: RequestInit & { request: Request },
    params: RequestInit
  ) {
    if (config.extensions) {
      for (const create of config.extensions) {
        const ext = await create(instance);
        if (ext.onRequest) {
          const modified = await ext.onRequest(_init.request);
          if (modified?.headers) {
            const modHeaders = new Headers(modified.headers);
            const cookie = modHeaders.get('cookie');
            if (cookie) {
              (params.headers as Headers).set('cookie', cookie);
              config.logger.debug(
                `extension ${ext.id ?? create.name} modified cookie`
              );
            }
          }
        }
        config.logger.debug(`extension ${ext.id ?? create.name} ran onRequest`);
      }
    }
  };
}

export function buildExtensionConfig(instance: Server) {
  return {
    handleOnRequest: bindHandleOnRequest(instance),
  };
}
