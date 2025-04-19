/* eslint-disable @typescript-eslint/no-explicit-any */
import { Config } from '../../utils/Config';

import _request from './request';

describe('request', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('sets the correct GET headers', async () => {
    global.fetch = jest.fn((url, p) => {
      return Promise.resolve({
        ...p,
        status: 200,
      }) as unknown as Promise<Response>;
    });
    const request = new Request('http://localhost:3001/v2/databases/123');
    const config = new Config();
    const res = await _request('http://localhost:3000', { request }, config);
    const expectedHeaders: any = {
      host: 'localhost:3001',
      'nile.origin': 'http://localhost:3001',
    };
    const headersObject = Object.entries(
      Object.fromEntries(res.headers.entries())
    );
    expect(headersObject.length).toBe(2);
    for (const [key, value] of headersObject) {
      const val = expectedHeaders[key];
      expect(value).toBe(val);
    }
  });
  it('sets the correct POST headers', async () => {
    global.fetch = jest.fn((url, p) => {
      return Promise.resolve({
        ...p,
        status: 200,
      }) as unknown as Promise<Response>;
    });
    const request = new Request('http://localhost:3001/v2/databases/123', {
      method: 'POST',
      body: 'userID=1234',
    });
    const config = new Config();
    const res = await _request(
      'http://localhost:3000',
      { request, method: 'POST' },
      config
    );
    const expectedHeaders: any = {
      host: 'localhost:3001',
      'nile.origin': 'http://localhost:3001',
      'content-type': 'application/x-www-form-urlencoded',
    };
    const headersObject = Object.entries(
      Object.fromEntries(res.headers.entries())
    );
    expect(headersObject.length).toBe(3);
    for (const [key, value] of headersObject) {
      const val = expectedHeaders[key];
      expect(value).toBe(val);
    }
  });
  it('sets the correct PUT headers', async () => {
    global.fetch = jest.fn((url, p) => {
      return Promise.resolve({
        ...p,
        status: 200,
      }) as unknown as Promise<Response>;
    });
    const request = new Request('http://localhost:3001/v2/databases/123', {
      method: 'PUT',
      body: JSON.stringify({ userID: '1234' }),
    });
    const config = new Config();
    const res = await _request(
      'http://localhost:3000',
      { request, method: 'POST' },
      config
    );
    const expectedHeaders: any = {
      host: 'localhost:3001',
      'nile.origin': 'http://localhost:3001',
      'content-type': 'application/json',
    };
    const headersObject = Object.entries(
      Object.fromEntries(res.headers.entries())
    );

    expect(headersObject.length).toBe(3);
    for (const [key, value] of headersObject) {
      const val = expectedHeaders[key];
      expect(value).toBe(val);
    }
  });
});
