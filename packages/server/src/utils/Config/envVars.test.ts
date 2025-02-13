import { getPassword, getUsername } from './envVars';

describe('env vars', () => {
  const prevURL = process.env.NILEDB_POSTGRES_URL;
  const prevUser = process.env.NILEDB_USER;
  const prevPass = process.env.NILEDB_PASSWORD;
  afterAll(() => {
    process.env.NILEDB_POSTGRES_URL = prevURL;
    process.env.NILEDB_USER = prevUser;
    process.env.NILEDB_PASSWORD = prevPass;
  });
  it('prefers the username/password from the env vars over NILEDB_POSTGRES_URL', () => {
    const password = 'password';
    const username = 'username';
    process.env.NILEDB_POSTGRES_URL = `postgres://${username}:${password}@us-west-2.db.dev.thenile.dev/niledb_cyan_tree`;
    expect(getPassword({})).toEqual(prevPass);
    expect(getUsername({})).toEqual(prevUser);
  });
  it('gets a username/password from NILEDB_POSTGRES_URL', () => {
    const password = 'password';
    const username = 'username';
    process.env.NILEDB_PASSWORD = '';
    process.env.NILEDB_USER = '';
    process.env.NILEDB_POSTGRES_URL = `postgres://${username}:${password}@us-west-2.db.dev.thenile.dev/niledb_cyan_tree`;
    expect(getPassword({})).toEqual(password);
    expect(getUsername({})).toEqual(username);
  });
  it('leaves username/password alone if it is not in the NILEDB_POSTGRES_URL', () => {
    const password = 'password';
    const username = 'username';
    process.env.NILEDB_USER = 'username';
    process.env.NILEDB_PASSWORD = 'password';
    process.env.NILEDB_POSTGRES_URL =
      'postgres://us-west-2.db.dev.thenile.dev/niledb_cyan_tree';
    expect(getPassword({})).toEqual(password);
    expect(getUsername({})).toEqual(username);
  });
});
