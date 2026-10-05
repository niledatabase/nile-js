import { AsyncLocalStorage } from 'async_hooks';
import { readFileSync } from 'fs';
import { join } from 'path';

import { getVercelOidcToken } from '@vercel/oidc';
import pg from 'pg';

import { postgresFixture } from '../test/postgres-fixture';

import { Config } from './utils/Config';
import Logger from './utils/Logger';
import { PoolWithLogger } from './db/PoolWithLogger';
import { create as Nile } from './Server';
import {
  createVercelConfig,
  OAuthBearerClient,
  VercelNileConfig,
} from './vercel';
import type { NileConfig, NilePoolConfig } from './types';

jest.mock('@vercel/oidc', () => ({ getVercelOidcToken: jest.fn() }));

const options: VercelNileConfig = {
  loginId: '5f32ec35-8519-4d86-bef0-14c55a6c8c76',
  databaseId: '16b220b8-670b-4d20-a64d-8bf769db73b8',
  databaseName: 'marketplace_db',
  vercelResourceId: 'store_test',
  host: 'db.thenile.dev',
  apiUrl:
    'https://us-west-2.api.thenile.dev/databases/16b220b8-670b-4d20-a64d-8bf769db73b8',
};

function response(token = 'resource-token', expiresIn = 300) {
  return new Response(
    JSON.stringify({
      token,
      tokenType: 'bearer',
      expiresIn,
      expiresAt: Date.now() + expiresIn * 1000,
    })
  );
}

function acquire(config: NileConfig) {
  const provider = config.oauthBearerToken;
  if (!provider) throw new Error('Missing token provider.');
  return () => provider(new AbortController().signal);
}

describe('Vercel resource authentication', () => {
  const originalFetch = global.fetch;
  const identity = jest.mocked(getVercelOidcToken);
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.useRealTimers();
    identity.mockReset().mockResolvedValue('workload-token');
    fetchMock = jest.fn().mockImplementation(async () => response());
    global.fetch = fetchMock;
  });
  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  it('does not acquire identity or mint during configuration or pool creation', async () => {
    const config = new Config(createVercelConfig(options));
    const pool = new PoolWithLogger(config.db, Logger(), []);
    expect(identity).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect((pool.options as NilePoolConfig).oauthBearerToken).toBe(
      config.db.oauthBearerToken
    );
    expect(pool.options.password).toBeUndefined();
    await pool.end();
  });

  it.each([300, 900])(
    'mints fresh default-claims tokens using returned %i second expiry',
    async (expiresIn) => {
      const config = createVercelConfig(options);
      const token = acquire(config);
      fetchMock
        .mockResolvedValueOnce(response('first-token', expiresIn))
        .mockResolvedValueOnce(response('next-token', expiresIn));
      expect(await token()).toBe('first-token');
      expect(await token()).toBe('next-token');
      expect(identity).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(
        'https://api.vercel.com/v1/integrations/marketplace/resources/store_test/token'
      );
      expect(init.method).toBe('POST');
      expect(init.redirect).toBe('error');
      expect(init.headers.Authorization).toBe('Bearer workload-token');
    }
  );

  it('uses each invocation identity and resource without sharing concurrent tokens', async () => {
    const request = new AsyncLocalStorage<string>();
    identity.mockImplementation(async () => request.getStore() ?? 'missing');
    fetchMock.mockImplementation(async (_url, init) =>
      response(init.headers.Authorization.slice('Bearer '.length))
    );
    const first = acquire(createVercelConfig(options));
    const second = acquire(
      createVercelConfig({
        ...options,
        vercelResourceId: 'store_other',
      })
    );
    const tokens = await Promise.all([
      request.run('project-one', first),
      request.run('project-two', second),
    ]);
    expect(tokens).toEqual(['project-one', 'project-two']);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      expect.stringContaining('/store_test/token'),
      expect.stringContaining('/store_other/token'),
    ]);
  });

  it.each([false, { rejectUnauthorized: false }, true])(
    'rejects unsafe effective SSL %p before minting',
    (ssl) => {
      const config = createVercelConfig(options);
      expect(
        () => new Config({ ...config, db: { ...config.db, ssl } })
      ).toThrow(/certificate-verified TLS/);
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it('rejects a competing connection string and runtime pool overrides before minting', async () => {
    const config = createVercelConfig(options);
    expect(
      () =>
        new Config({
          ...config,
          db: {
            ...config.db,
            connectionString:
              'postgres://other:password@example.com/db?sslmode=disable',
          },
        })
    ).toThrow(/connectionString/);
    const resolved = new Config(config);
    const pool = new PoolWithLogger(resolved.db, Logger(), []);
    expect(() => {
      pool.options.ssl = false;
    }).toThrow(/read only/);
    expect(fetchMock).not.toHaveBeenCalled();
    await pool.end();
  });

  it('does not fetch after workload identity acquisition fails', async () => {
    identity.mockRejectedValue(new Error('private workload token'));
    const token = acquire(createVercelConfig(options));
    await expect(token()).rejects.toThrow('workload identity is unavailable');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps the public factory bound to each supplied resource and provider', async () => {
    const firstConfig = createVercelConfig(options);
    const secondConfig = createVercelConfig({
      ...options,
      loginId: '515432bb-a37b-41c7-8e8d-dc1c247de420',
      databaseId: 'd8058d30-fb3e-42c1-98b3-9257be1b704a',
      databaseName: 'another_database',
      host: 'another.example.test',
      vercelResourceId: 'store_other',
    });
    const first = Nile(firstConfig);
    const legacy = Nile({
      ...options,
      user: 'legacy-login',
      password: 'legacy-password',
    });
    const second = Nile({
      ...secondConfig,
      oauthBearerToken: undefined,
      db: {
        ...secondConfig.db,
        oauthBearerToken: secondConfig.oauthBearerToken,
      },
    });
    const firstPool = first.db;
    const secondPool = second.db;
    try {
      expect(second).not.toBe(first);
      expect(legacy).not.toBe(first);
      expect(Nile()).toBe(legacy);
      expect(secondPool).not.toBe(firstPool);
      expect((firstPool.options as NilePoolConfig).oauthBearerToken).toBe(
        firstConfig.oauthBearerToken
      );
      expect((secondPool.options as NilePoolConfig).oauthBearerToken).toBe(
        secondConfig.oauthBearerToken
      );
      expect(firstPool.options.password).toBeUndefined();
      expect(secondPool.options.password).toBeUndefined();
      expect(secondPool.options.database).toBe('another_database');
      expect(secondPool.options.host).toBe('another.example.test');
      await Promise.all([acquire(firstConfig)(), acquire(secondConfig)()]);
      expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
        expect.stringContaining('/store_test/token'),
        expect.stringContaining('/store_other/token'),
      ]);
    } finally {
      firstPool.clearConnections();
      secondPool.clearConnections();
    }
  });

  it('propagates denied minting without including tokens or response messages', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: 'invalid_role', message: 'private resource token' },
        }),
        { status: 400 }
      )
    );
    const token = acquire(createVercelConfig(options));
    await expect(token()).rejects.toThrow('HTTP 400 (invalid_role)');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    { token: 'token', tokenType: 'bearer', expiresIn: 300, expiresAt: 1 },
    {
      token: 'token',
      tokenType: 'bearer',
      expiresIn: 300,
      expiresAt: Math.floor(Date.now() / 1000) + 300,
    },
    {
      token: 'token',
      tokenType: 'other',
      expiresIn: 900,
      expiresAt: Date.now() + 900000,
    },
  ])('rejects malformed or expired mint fields', async (body) => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(body)));
    const token = acquire(createVercelConfig(options));
    await expect(token()).rejects.toThrow('invalid token or expiry fields');
  });

  it('bounds response size and does not retry', async () => {
    fetchMock.mockResolvedValue(new Response('x'.repeat(20000)));
    const token = acquire(createVercelConfig(options));
    await expect(token()).rejects.toThrow('invalid response');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('bounds identity acquisition and never mints if a late identity arrives', async () => {
    jest.useFakeTimers();
    let resolveIdentity!: (token: string) => void;
    identity.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveIdentity = resolve;
        })
    );
    const token = acquire(createVercelConfig(options));
    const result = expect(token()).rejects.toThrow('timed out');
    await jest.advanceTimersByTimeAsync(5000);
    await result;
    resolveIdentity('late-private-token');
    await Promise.resolve();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  const fixtures = join(__dirname, '../test/fixtures/vercel-tls');
  const key = readFileSync(join(fixtures, 'localhost-key.pem'));
  const cert = readFileSync(join(fixtures, 'localhost-cert.pem'));
  const wrongHostCert = readFileSync(join(fixtures, 'wrong-host-cert.pem'));

  it('requires a DNS hostname before acquiring workload identity', () => {
    expect(() => createVercelConfig({ ...options, host: '127.0.0.1' })).toThrow(
      /DNS host/
    );
    expect(identity).not.toHaveBeenCalled();
  });

  it('reaches pg with verified TLS and mints for every new physical connection', async () => {
    const server = await postgresFixture({ key, cert }, { method: 'oauth' });
    const config = new Config(
      createVercelConfig({
        ...options,
        host: 'localhost',
        port: server.port,
        ca: cert.toString(),
      })
    );
    const pool = new PoolWithLogger(
      { ...config.db, max: 1, maxUses: 1 },
      Logger(),
      []
    );
    fetchMock
      .mockResolvedValueOnce(response('physical-first'))
      .mockResolvedValueOnce(response('physical-second'));
    try {
      const first = await pool.connect();
      first.release();
      const second = await pool.connect();
      second.release();
      expect(server.sasl).toEqual(
        ['physical-first', 'physical-second'].map((token) => ({
          mechanism: 'OAUTHBEARER',
          length: Buffer.byteLength(`n,,\x01auth=Bearer ${token}\x01\x01`),
          response: Buffer.from(`n,,\x01auth=Bearer ${token}\x01\x01`),
        }))
      );
      expect(server.passwords).toEqual([]);
      expect(identity).toHaveBeenCalledTimes(2);
    } finally {
      await pool.end();
      await server.close();
    }
  });

  it('keeps TLS fixed while pg queues a new physical connection', async () => {
    const server = await postgresFixture({ key, cert }, { method: 'oauth' });
    const config = new Config(
      createVercelConfig({
        ...options,
        host: 'localhost',
        port: server.port,
        ca: cert.toString(),
      })
    );
    const pool = new PoolWithLogger(
      { ...config.db, max: 1, maxUses: 1 },
      Logger(),
      []
    );
    let heldClient;
    try {
      heldClient = await pool.connect();
      const queued = pool.connect();
      expect(pool.waitingCount).toBe(1);
      expect(() => {
        pool.options.ssl = false;
      }).toThrow(/read only/);
      expect(() => {
        (pool.options as NilePoolConfig).oauthBearerToken = async () =>
          'other-token';
      }).toThrow(/read only/);
      expect(() => {
        pool.options.Client = pg.Client;
      }).toThrow(/read only/);
      expect(() => {
        (pool as unknown as { Client: typeof pg.Client }).Client = pg.Client;
      }).toThrow(/read only/);
      expect(() => {
        pool.options = {
          ...pool.options,
          oauthBearerToken: config.db.oauthBearerToken,
          ssl: false,
        } as typeof pool.options & NilePoolConfig;
      }).toThrow(/read only/);
      heldClient.release();
      heldClient = undefined;
      const next = await queued;
      next.release();
      expect(server.sasl.map(({ response }) => response.toString())).toEqual([
        'n,,\x01auth=Bearer resource-token\x01\x01',
        'n,,\x01auth=Bearer resource-token\x01\x01',
      ]);
      expect(identity).toHaveBeenCalledTimes(2);
    } finally {
      heldClient?.release();
      await pool.end();
      await server.close();
    }
  });

  it('reuses an authenticated physical connection without minting again', async () => {
    const server = await postgresFixture({ key, cert }, { method: 'oauth' });
    const nile = Nile(
      createVercelConfig({
        ...options,
        host: 'localhost',
        port: server.port,
        ca: cert.toString(),
      })
    );
    const pool = nile.db;
    try {
      const first = await pool.connect();
      await first.query('BEGIN');
      await first.query('COMMIT');
      first.release();
      const second = await pool.connect();
      expect(second).toBe(first);
      second.release();
      expect(server.sasl).toHaveLength(1);
      expect(identity).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      pool.clearConnections();
      await server.close();
    }
  });

  it.each(['cleartext', 'md5', 'scram', 'trust'] as const)(
    'rejects %s authentication before acquiring identity or sending a token',
    async (method) => {
      const server = await postgresFixture({ key, cert }, { method });
      const config = new Config(
        createVercelConfig({
          ...options,
          host: 'localhost',
          port: server.port,
          ca: cert.toString(),
        })
      );
      const pool = new PoolWithLogger(config.db, Logger(), []);
      try {
        await expect(
          pool.connect().then((client) => client.release())
        ).rejects.toThrow(/OAUTHBEARER/);
        expect(identity).not.toHaveBeenCalled();
        expect(fetchMock).not.toHaveBeenCalled();
        expect(server.passwords).toEqual([]);
        expect(server.sasl).toEqual([]);
      } finally {
        await pool.end();
        await server.close();
      }
    }
  );

  it('acknowledges invalid_token with one byte and hides server authentication details', async () => {
    const server = await postgresFixture(
      { key, cert },
      {
        method: 'oauth',
        failure: JSON.stringify({
          status: 'invalid_token',
          detail: 'private bearer token',
        }),
      }
    );
    const config = new Config(
      createVercelConfig({
        ...options,
        host: 'localhost',
        port: server.port,
        ca: cert.toString(),
      })
    );
    const pool = new PoolWithLogger(config.db, Logger(), []);
    try {
      await expect(pool.connect()).rejects.toMatchObject({
        message: 'OAUTHBEARER authentication failed.',
        code: '28P01',
      });
      expect(server.acknowledgements).toEqual([Buffer.from([1])]);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      await pool.end();
      await server.close();
    }
  });

  it('supports a direct pg Pool through the helper without password transport', async () => {
    const server = await postgresFixture({ key, cert }, { method: 'oauth' });
    const config = createVercelConfig({
      ...options,
      host: 'localhost',
      port: server.port,
      ca: cert.toString(),
    });
    const pool = new pg.Pool({
      ...config.db,
      user: config.user,
      database: config.databaseName,
    });
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      expect(server.sasl[0].response.toString()).toBe(
        'n,,\x01auth=Bearer resource-token\x01\x01'
      );
      expect(server.passwords).toEqual([]);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      await pool.end();
      await server.close();
    }
  });

  it('keeps tokens and reused connections in their owning resource instances', async () => {
    const firstServer = await postgresFixture(
      { key, cert },
      { method: 'oauth' }
    );
    const secondServer = await postgresFixture(
      { key, cert },
      { method: 'oauth' }
    );
    fetchMock.mockImplementation(async (url: string) =>
      response(
        url.includes('/store_test/') ? 'resource-first' : 'resource-second'
      )
    );
    const first = Nile(
      createVercelConfig({
        ...options,
        host: 'localhost',
        port: firstServer.port,
        ca: cert.toString(),
      })
    ).db;
    const second = Nile(
      createVercelConfig({
        ...options,
        vercelResourceId: 'store_other',
        loginId: '515432bb-a37b-41c7-8e8d-dc1c247de420',
        host: 'localhost',
        port: secondServer.port,
        ca: cert.toString(),
      })
    ).db;
    try {
      const clients = await Promise.all([first.connect(), second.connect()]);
      clients.forEach((client) => client.release());
      const reused = await first.connect();
      expect(reused).toBe(clients[0]);
      reused.release();
      expect(
        firstServer.sasl.map(({ response }) => response.toString())
      ).toEqual(['n,,\x01auth=Bearer resource-first\x01\x01']);
      expect(
        secondServer.sasl.map(({ response }) => response.toString())
      ).toEqual(['n,,\x01auth=Bearer resource-second\x01\x01']);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      first.clearConnections();
      second.clearConnections();
      await firstServer.close();
      await secondServer.close();
    }
  });

  it.each(['resolve', 'reject'] as const)(
    'ignores a late provider %s after client cancellation',
    async (result) => {
      const server = await postgresFixture({ key, cert }, { method: 'oauth' });
      let resolveToken!: (token: string) => void;
      let rejectToken!: (error: Error) => void;
      let started!: () => void;
      let signal: AbortSignal | undefined;
      const ready = new Promise<void>((resolve) => {
        started = resolve;
      });
      const token = new Promise<string>((resolve, reject) => {
        resolveToken = resolve;
        rejectToken = reject;
      });
      const client = new OAuthBearerClient({
        host: 'localhost',
        port: server.port,
        user: 'login',
        database: 'database',
        ssl: { rejectUnauthorized: true, ca: cert.toString() },
        oauthBearerToken: (abort) => {
          signal = abort;
          started();
          return token;
        },
      });
      try {
        const connected = expect(client.connect()).rejects.toThrow(/cancelled/);
        await ready;
        await client.end();
        await connected;
        expect(signal?.aborted).toBe(true);
        if (result === 'resolve') resolveToken('late-private-token');
        else rejectToken(new Error('late-private-token'));
        await new Promise<void>((resolve) => setImmediate(resolve));
        expect(server.sasl).toEqual([]);
        expect(server.passwords).toEqual([]);
      } finally {
        await client.end();
        await server.close();
      }
    }
  );

  it('aborts a pending Vercel identity when the physical connection times out', async () => {
    const server = await postgresFixture({ key, cert }, { method: 'oauth' });
    let resolveIdentity!: (token: string) => void;
    identity.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveIdentity = resolve;
        })
    );
    const config = new Config(
      createVercelConfig({
        ...options,
        host: 'localhost',
        port: server.port,
        ca: cert.toString(),
      })
    );
    const pool = new PoolWithLogger(
      { ...config.db, connectionTimeoutMillis: 100 },
      Logger(),
      []
    );
    try {
      await expect(pool.connect()).rejects.toThrow(/timeout/);
      expect(identity).toHaveBeenCalledTimes(1);
      resolveIdentity('late-private-identity');
      await new Promise<void>((resolve) => setImmediate(resolve));
      expect(fetchMock).not.toHaveBeenCalled();
      expect(server.sasl).toEqual([]);
    } finally {
      await pool.end();
      await server.close();
    }
  });

  it('sanitizes provider rejection on the real connection without fallback', async () => {
    const server = await postgresFixture({ key, cert }, { method: 'oauth' });
    const provider = jest
      .fn()
      .mockRejectedValue(new Error('private-bearer-token'));
    const config = new Config({
      apiUrl: options.apiUrl,
      user: options.loginId,
      databaseName: options.databaseName,
      oauthBearerToken: provider,
      db: {
        host: 'localhost',
        port: server.port,
        ssl: { rejectUnauthorized: true, ca: cert.toString() },
      },
    });
    const pool = new PoolWithLogger(config.db, Logger(), []);
    try {
      await expect(pool.connect()).rejects.toThrow(
        'OAUTHBEARER token acquisition failed.'
      );
      expect(provider).toHaveBeenCalledTimes(1);
      expect(server.sasl).toEqual([]);
      expect(server.passwords).toEqual([]);
    } finally {
      await pool.end();
      await server.close();
    }
  });

  it.each([
    { label: 'untrusted', cert, ca: undefined },
    { label: 'wrong-host', cert: wrongHostCert, ca: wrongHostCert.toString() },
  ])('rejects $label certificate before minting', async (tls) => {
    const server = await postgresFixture({ key, cert: tls.cert });
    const config = new Config(
      createVercelConfig({
        ...options,
        host: 'localhost',
        ca: tls.ca,
        port: server.port,
      })
    );
    const pool = new PoolWithLogger(
      { ...config.db, connectionTimeoutMillis: 1000 },
      Logger(),
      []
    );
    try {
      await expect(
        pool.connect().then((client) => {
          client.release();
          return client;
        })
      ).rejects.toThrow();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(server.passwords).toEqual([]);
    } finally {
      await pool.end();
      await server.close();
    }
  });
});
