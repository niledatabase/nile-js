import { ServerConfig } from '../../types';
import { Config } from '../Config';

export const getServerId = (config: ServerConfig) => {
  const cfg = new Config(config);
  return makeServerId(cfg);
};
export const makeServerId = (config: Config) => {
  return Buffer.from(JSON.stringify(config), 'utf8').toString('base64');
};
