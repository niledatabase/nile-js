import { Config } from '../../../utils/Config';

const NILEDB_API_URL = process.env.NILEDB_API_URL;

export function makeRestUrl(
  config: Config,
  path: string,
  qp?: Record<string, string>
) {
  const url = config.api.basePath || NILEDB_API_URL;
  if (!url) {
    throw new Error(
      'An API url is required. Set it via NILEDB_API_URL. Was auto configuration run?'
    );
  }
  const params = new URLSearchParams(qp);
  return `${[url, path.substring(1, path.length)].join('/')}${
    qp ? `?${params.toString()}` : ''
  }`;
}
