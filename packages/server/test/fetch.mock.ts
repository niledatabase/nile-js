import { Config } from '../src/utils/Config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Something = any;

export class FakeResponse {
  [key: string]: Something;
  payload: string;
  headers?: Headers;
  constructor(payload: string, config?: RequestInit) {
    this.payload = payload;
    if (config) {
      this.headers = new Headers(config.headers);
    }
    if (typeof payload === 'string') {
      const pload = JSON.parse(payload);
      Object.keys(pload).map((key) => {
        this[key] = pload[key];
      });
    }
  }
  json = async () => {
    return JSON.parse(this.payload);
  };
  text = async () => {
    return this.payload;
  };
}

export const _fetch = (payload?: Record<string, Something>) =>
  (async (config: Config, path: string, opts?: RequestInit) => {
    return new FakeResponse(
      JSON.stringify({
        ...payload,
        config,
        path,
        opts,
        status: 200,
      })
    );
  }) as unknown as typeof fetch;
