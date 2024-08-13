export default function middleware(
  request: Request,
  response: Response,
  patterns:
    | string
    | string[]
    | { matcher: string | string[]; key?: string }
    | (() => string)
) {
  let tenantId = null;

  if (typeof patterns === 'function') {
    tenantId = patterns();
  } else if (typeof patterns === 'string' || Array.isArray(patterns)) {
    const parsed = params(request.url, patterns);
    tenantId = parsed.tenantId;
  } else {
    const { matcher, key = 'tenantId' } = patterns;
    const parsed = params(request.url, matcher);
    tenantId = parsed[key];
  }
  if (tenantId) {
    response.headers.set('niledb-tenant-id', tenantId);
  }
}

type ReturnParams = { [key: string]: string };

const params = (url: string, patterns: string | string[]): ReturnParams => {
  const input = url.split('?')[0];
  let result = {};
  const handleGroups = ({ pathname }: { pathname: { groups: string[] } }) =>
    pathname.groups;

  function mapPat(str: string) {
    // @ts-expect-error - doesn't have it yet
    return [new URLPattern({ pathname: str }), handleGroups];
  }

  const basePattern = [
    // @ts-expect-error - doesn't have it yet
    new URLPattern({ pathname: patterns }),
    handleGroups,
  ];
  const pats = Array.isArray(patterns) ? patterns.map(mapPat) : basePattern;

  for (const [pattern, handler] of pats) {
    const patternResult = pattern.exec(input);
    if (patternResult !== null && 'pathname' in patternResult) {
      result = handler(patternResult);
      break;
    }
  }
  return result;
};
