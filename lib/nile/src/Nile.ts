import NileApi from './NileApi';
/**
 * the below files need generated with `yarn build:exp`
 */
import {
  createConfiguration,
  ConfigurationParameters,
} from './generated/openapi/configuration';
import { ServerConfiguration } from './generated/openapi/servers';
import {
  DefaultApiRequestFactory,
  DefaultApiResponseProcessor,
} from './generated/openapi/apis/DefaultApi';

function ApiImpl(
  config?: ConfigurationParameters & { apiUrl: string }
): NileApi {
  const server = new ServerConfiguration<{ [key: string]: string }>(
    config?.apiUrl ?? '/',
    {}
  );
  const _config = {
    baseServer: server,
    ...config,
  };
  const cfg = createConfiguration(_config);
  const nileService = new DefaultApiRequestFactory(cfg);
  const nileProcessor = new DefaultApiResponseProcessor();
  const nile = new NileApi(cfg, nileService, nileProcessor);
  return nile;
}
export default ApiImpl;
