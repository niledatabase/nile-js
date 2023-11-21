/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
};

process.env.USER = '';
process.env.PASSWORD = '';
process.env.WORKSPACE = '';
process.env.DATABASE = '';
process.env.USER_ID = '';
