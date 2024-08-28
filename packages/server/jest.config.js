// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};

process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'test';
process.env.NILEDB_HOST = 'db.thenile.dev';
process.env.NILEDB_PASSWORD = 'super_secret';
process.env.NILEDB_USER = 'shhhh';
