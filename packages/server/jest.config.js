// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};

process.env.NODE_ENV = 'TEST';
