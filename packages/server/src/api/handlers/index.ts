import { Config } from '../../utils/Config';
import { Routes } from '../types';

import getter from './GET';
import poster from './POST';
import deleter from './DELETE';
import puter from './PUT';

export default function Handlers(configRoutes: Routes, config: Config) {
  const GET = getter(configRoutes, config);
  const POST = poster(configRoutes, config);
  const DELETE = deleter(configRoutes, config);
  const PUT = puter(configRoutes, config);
  return {
    GET,
    POST,
    DELETE,
    PUT,
  };
}
