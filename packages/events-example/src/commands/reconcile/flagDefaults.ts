import { Flags } from '@oclif/core';

export const flagDefaults = {
  basePath: Flags.string({
    description: 'root URL for the Nile API',
    default: 'http://localhost:8080',
  }),
  workspace: Flags.string({
    description: 'your Nile workspace name',
    default: 'dev',
  }),
  email: Flags.string({
    description: 'developer email address',
    default: 'developer@demo.com',
  }),
  password: Flags.string({
    description: 'developer password',
    default: 'very_secret',
  }),
  organization: Flags.string({
    description: 'an organization in your Nile workspace',
  }),
  entity: Flags.string({
    description: 'an entity type in your Nile workspace',
  }),
  status: Flags.boolean({
    char: 's',
    description: 'check current status of your control and data planes',
    default: false,
  }),
  region: Flags.string({ description: 'AWS region', default: 'us-west-2' }),
};
