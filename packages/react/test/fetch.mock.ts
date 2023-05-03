class FakeResponse {
  payload: string;
  constructor(payload: string) {
    this.payload = payload;
    const pload = JSON.parse(payload);
    Object.keys(pload).map((key) => {
      // @ts-expect-error - its a mock
      this[key] = pload[key];
    });
  }
  json = async () => {
    return this.payload;
  };
}

export async function _token() {
  return new FakeResponse(
    JSON.stringify({
      token: {
        token: 'something',
        maxAge: 3600,
      },
    })
  );
}
// it's fake, but it's fetch.
export const token = _token as unknown as typeof fetch;
