export function fQUrl(callbackUrl: null | string, path: string) {
  if (path.startsWith('/')) {
    if (callbackUrl) {
      const { origin } = new URL(callbackUrl);
      return `${origin}${path}`;
    }
  }
  try {
    new URL(path);
  } catch {
    throw new Error('An invalid URL has been passed.');
  }
  return path;
}
