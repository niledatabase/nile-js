import { Config } from '.';

describe('Configure', () => {
  const prevURL = process.env.NILEDB_POSTGRES_URL;
  const prevUser = process.env.NILEDB_USER;
  const prevPass = process.env.NILEDB_PASSWORD;
  afterAll(() => {
    process.env.NILEDB_POSTGRES_URL = prevURL;
    process.env.NILEDB_USER = prevUser;
    process.env.NILEDB_PASSWORD = prevPass;
  });
  global.fetch = jest.fn();

  beforeEach(() => {
    //@ts-expect-error - fetch
    global.fetch.mockClear();
  });
  it('does not call auto configure if it has all the information it needs', async () => {
    const config = new Config({});
    await config.configure({});
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
