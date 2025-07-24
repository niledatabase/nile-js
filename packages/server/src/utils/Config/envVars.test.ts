import { EnvConfig, getPassword, getUsername } from './envVars';

describe('env vars', () => {
  const prevURL = process.env.NILEDB_POSTGRES_URL;
  const prevUser = process.env.NILEDB_USER;
  const prevPass = process.env.NILEDB_PASSWORD;
  let config: EnvConfig;
  beforeEach(() => {
    config = {
      config: {
        logger: () => ({
          info: jest.fn,
          warn: jest.fn,
          error: jest.fn,
          debug: jest.fn,
          silly: jest.fn,
        }),
      },
    };
  });
  afterAll(() => {
    process.env.NILEDB_POSTGRES_URL = prevURL;
    process.env.NILEDB_USER = prevUser;
    process.env.NILEDB_PASSWORD = prevPass;
  });
  it('prefers the username/password from the env vars over NILEDB_POSTGRES_URL', () => {
    const password = 'password';
    const username = 'username';
    process.env.NILEDB_POSTGRES_URL = `postgres://${username}:${password}@us-west-2.db.dev.thenile.dev/niledb_cyan_tree`;
    expect(getPassword(config)).toEqual(prevPass);
    expect(getUsername(config)).toEqual(prevUser);
  });
  it('gets a username/password from NILEDB_POSTGRES_URL', () => {
    const password = 'password';
    const username = 'username';
    process.env.NILEDB_PASSWORD = '';
    process.env.NILEDB_USER = '';
    process.env.NILEDB_POSTGRES_URL = `postgres://${username}:${password}@us-west-2.db.dev.thenile.dev/niledb_cyan_tree`;
    expect(getPassword(config)).toEqual(password);
    expect(getUsername(config)).toEqual(username);
  });
  it('leaves username/password alone if it is not in the NILEDB_POSTGRES_URL', () => {
    const password = 'password';
    const username = 'username';
    process.env.NILEDB_USER = 'username';
    process.env.NILEDB_PASSWORD = 'password';
    process.env.NILEDB_POSTGRES_URL =
      'postgres://us-west-2.db.dev.thenile.dev/niledb_cyan_tree';
    expect(getPassword(config)).toEqual(password);
    expect(getUsername(config)).toEqual(username);
  });
});
