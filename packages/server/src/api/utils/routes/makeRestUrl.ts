const NILEDB_API_URL = process.env.NILEDB_API_URL;

export function makeRestUrl(path: string, qp?: Record<string, string>) {
  if (!NILEDB_API_URL) {
    throw new Error('An API url is required. Set it via NILEDB_API_URL.');
  }
  const params = new URLSearchParams(qp);
  return `${[NILEDB_API_URL, path.substring(1, path.length)].join('/')}${
    qp ? `?${params.toString()}` : ''
  }`;
}
