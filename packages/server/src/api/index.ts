import { Config } from '../utils/Config';

import Handlers from './handlers';
import { appRoutes } from './utils/routes/defaultRoutes';

export default function NewNileApi(config: Config) {
  const routes = {
    ...appRoutes(config?.routePrefix),
    ...config?.routes,
  };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const handlers = Handlers(routes, config);
  return {
    handlers,
  };
}
