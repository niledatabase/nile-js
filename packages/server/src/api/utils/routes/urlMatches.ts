export default function urlMatches(requestUrl: string, route: string) {
  const url = new URL(requestUrl);
  return url.pathname.startsWith(route);
}
