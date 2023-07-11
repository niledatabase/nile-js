import { Config } from '../src/utils/Config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Something = any;

export class FakeResponse {
  [key: string]: Something;
  payload: object | string;
  headers?: Headers;
  constructor(payload: object | string, config?: RequestInit) {
    this.payload = payload;
    if (config) {
      this.headers = new Headers(config.headers);
    }
    let pload = payload;
    if (typeof payload === 'string') {
      pload = JSON.parse(payload);
    }

    Object.keys(pload).map((key) => {
      this[key] = (pload as Record<string, Something>)[key];
    });
  }
  json = async () => {
    if (typeof this.payload === 'string') {
      return JSON.parse(this.payload);
    }
    return this.payload;
  };
  text = async () => {
    return this.payload;
  };
}

export class FakeRequest {
  [key: string]: Something;
  constructor(url: string, config?: RequestInit) {
    this.payload = config?.body;
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
    return new FakeResponse({
      ...payload,
      config,
      path,
      opts,
      status: 200,
    });
  }) as unknown as typeof fetch;
