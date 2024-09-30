export function isUUID(value: string | null | undefined) {
  if (!value) {
    return false;
  }
  // is any UUID
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5|7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  return regex.test(value);
}
