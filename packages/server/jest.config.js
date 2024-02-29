module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};

process.env.USER = '';
process.env.PASSWORD = '';
process.env.WORKSPACE = '';
process.env.DATABASE = '';
process.env.USER_ID = '';
process.env.NODE_ENV = 'TEST';
