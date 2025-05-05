import { Server } from '../../../Server';
import { Config } from '../../../utils/Config';

import { handlersWithContext } from '.';

jest.mock('../../../Server', () => ({
  Server: jest.fn().mockImplementation((config) => ({
    config,
  })),
}));

const mockGET = jest.fn();
const mockPOST = jest.fn();
const mockDELETE = jest.fn();
const mockPUT = jest.fn();

jest.mock('../GET', () => jest.fn(() => mockGET));
jest.mock('../POST', () => jest.fn(() => mockPOST));
jest.mock('../DELETE', () => jest.fn(() => mockDELETE));
jest.mock('../PUT', () => jest.fn(() => mockPUT));

describe('handlersWithContext', () => {
  const config: Config = new Config({
    origin: 'https://api.example.com',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all four HTTP method handlers', () => {
    const handlers = handlersWithContext(config);
    expect(handlers).toHaveProperty('GET');
    expect(handlers).toHaveProperty('POST');
    expect(handlers).toHaveProperty('DELETE');
    expect(handlers).toHaveProperty('PUT');
  });

  it('returns GET handler that wraps the response and creates a new Server', async () => {
    const mockResponse = new Response(null, { status: 200 });
    mockGET.mockResolvedValueOnce(mockResponse);

    const handlers = handlersWithContext(config);
    const result = await handlers.GET(new Request('http://localhost'));

    expect(mockGET).toHaveBeenCalled();
    expect(result.response).toBe(mockResponse);

    // Server constructor should have been called with updated origin
    expect(Server).toHaveBeenCalledWith({
      ...config,
      headers: undefined,
      origin: 'http://localhost:3000',
    });
    //@ts-expect-error - internal inspection
    expect(result.nile.config.origin).toBe('http://localhost:3000');
  });

  it('returns POST handler that matches input', async () => {
    const handlers = handlersWithContext(config);
    const mockReq = new Request('http://localhost', { method: 'POST' });
    await handlers.POST(mockReq);
    expect(mockPOST).toHaveBeenCalledWith(mockReq);
  });

  it('returns DELETE handler that matches input', async () => {
    const handlers = handlersWithContext(config);
    const mockReq = new Request('http://localhost', { method: 'DELETE' });
    await handlers.DELETE(mockReq);
    expect(mockDELETE).toHaveBeenCalledWith(mockReq);
  });

  it('returns PUT handler that matches input', async () => {
    const handlers = handlersWithContext(config);
    const mockReq = new Request('http://localhost', { method: 'PUT' });
    await handlers.PUT(mockReq);
    expect(mockPUT).toHaveBeenCalledWith(mockReq);
  });
});
