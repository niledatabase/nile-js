const NILEDB_API_URL = process.env.NILEDB_API_URL;

export function makeRestUrl(path: string) {
  if (!NILEDB_API_URL) {
    throw new Error('An API url is required. Set it via NILEDB_API_URL.');
  }
  return [NILEDB_API_URL, path.substring(1, path.length)].join('/');
}
