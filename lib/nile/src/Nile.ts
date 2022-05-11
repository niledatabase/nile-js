/**
 * dependencies need generated with `yarn build:api:gen`
 */
import { DefaultApi } from './generated/openapi/src/';
import { Configuration } from './generated/openapi/src/runtime';

type NileConfig = Configuration & { apiUrl: string };
function ApiImpl(config?: NileConfig): DefaultApi {
  if (!config) {
    return new DefaultApi();
  }

  const cfg = new Configuration({ ...config, basePath: config.apiUrl });
  const nile = new DefaultApi(cfg);
  return nile;
}
export default ApiImpl;
