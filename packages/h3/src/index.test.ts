// @ts-nocheck
import { createApp, eventHandler, toNodeListener, H3Event } from 'h3';
import { createServer } from 'http';

// Set Env vars before importing Nile server
process.env.NILEDB_ID = 'db-mock-id';
process.env.NILEDB_USER = 'db-mock-user';
process.env.NILEDB_PASSWORD = 'db-mock-password';
process.env.NILEDB_NAME = 'db-mock-name';
process.env.NILEDB_API_URL = 'http://localhost:1234';

describe('h3 extension', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should inject nile into event context and propagate request context', async () => {
    const { Nile } = await import('@niledatabase/server');
    const { h3 } = await import('./index');
    const app = createApp();
    // Use the REAL Nile server (no mocks)
    const nile = await Nile({
      extensions: [h3(app)],
    });

    app.use(
      '/test',
      eventHandler(async (event: H3Event) => {
        if (!event.context.nile) {
          throw new Error('Nile not attached to event context');
        }

        expect(event.context.nile).toBe(nile);

        const ctx = nile.getContext();

        const tenantIdHeader = ctx.headers.get('x-tenant-id');

        return {
          nilePresent: !!event.context.nile,
          tenantIdHeader,
        };
      })
    );

    const response = await makeRequest(app, {
      headers: {
        'X-Tenant-Id': 'tenant-abc',
      },
    });

    expect(response.nilePresent).toBe(true);
    expect(response.tenantIdHeader).toBe('tenant-abc');
  });

  it('should register nile routes', async () => {
    const { Nile } = await import('@niledatabase/server');
    const { h3 } = await import('./index');
    const app = createApp();
    const nile = await Nile({
      extensions: [h3(app)],
    });

    const path = nile.paths?.get?.[0];

    if (!path) {
      return;
    }

    const response = await makeRequest(app, { path });
    // Expect not 404 (failed before)
    expect(response.statusCode).not.toBe(404);
  });
});

function makeRequest(
  app: any,
  options: { headers?: Record<string, string>; path?: string } = {}
): Promise<any> {
  return new Promise((resolve) => {
    const server = createServer(toNodeListener(app));
    const req = server.listen(0, () => {
      const port = (req.address() as any).port;
      import('http').then((http) => {
        const request = http.request(
          `http://localhost:${port}${options.path || '/test'}`,
          {
            headers: options.headers,
          },
          (res) => {
            let data = '';
            res.on('data', (c) => (data += c));
            res.on('end', () =>
              resolve({
                ...JSON.parse(data.startsWith('{') ? data : '{}'),
                statusCode: res.statusCode,
              })
            );
            server.close();
          }
        );
        request.end();
      });
    });
  });
}
