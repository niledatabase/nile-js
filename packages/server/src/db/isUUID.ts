export function isUUID(value: string | null | undefined) {
  if (!value) {
    return false;
  }
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(value);
}
