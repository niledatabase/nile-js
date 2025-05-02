import { Config } from '../../../utils/Config';

const NILEDB_API_URL = process.env.NILEDB_API_URL;

function filterNullUndefined(
  obj?: Record<string, string | null>
): { [k: string]: string | null } | undefined {
  if (!obj) {
    return undefined;
  }
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== null && value !== undefined
    )
  );
}

export function makeRestUrl(
  config: Config,
  path: string,
  qp?: Record<string, string | null>
) {
  const url = config.apiUrl || NILEDB_API_URL;
  if (!url) {
    throw new Error(
      'An API url is required. Set it via NILEDB_API_URL. Was auto configuration run?'
    );
  }
  const params = new URLSearchParams(
    filterNullUndefined(qp) as Record<string, string>
  );
  const strParams = params.toString();
  return `${[url, path.substring(1, path.length)].join('/')}${
    strParams ? `?${strParams}` : ''
  }`;
}
