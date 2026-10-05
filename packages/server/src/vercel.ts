import { isIP } from 'net';

import { getVercelOidcToken } from '@vercel/oidc';

import type { NileConfig, NilePoolConfig } from './types';
import { registerConnectionGuard } from './utils/connection-guard';
import { OAuthBearerClient } from './db/OAuthBearerClient';

export { OAuthBearerClient } from './db/OAuthBearerClient';

const MINT_TIMEOUT_MS = 5000;
const MAX_RESPONSE_BYTES = 16384;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type VercelNileConfig = {
  /** The dedicated OIDC login UUID supplied by Nile, not the password login. */
  loginId: string;
  databaseId: string;
  databaseName: string;
  /** The Vercel integration resource ID, not the Nile database UUID. */
  vercelResourceId: string;
  /** The published database DNS hostname. Its certificate must match this host. */
  host: string;
  apiUrl: string;
  port?: number;
  /** Optional trusted certificate authority; system trust is used by default. */
  ca?: string;
};

/**
 * Server-only configuration for default-claims Vercel Marketplace authentication.
 * Creating this configuration does not acquire a token. OAUTHBEARER negotiation
 * calls the provider for each physical connection, using the current request identity.
 * Requires Node 20 or later and @vercel/oidc.
 */
export function createVercelConfig(options: VercelNileConfig): NileConfig {
  if (typeof window !== 'undefined') {
    throw new Error(
      'Vercel Marketplace database authentication is server-only.'
    );
  }
  if (!UUID.test(options.loginId) || !UUID.test(options.databaseId)) {
    throw new Error('Nile loginId and databaseId must be UUIDs.');
  }
  if (
    !options.vercelResourceId ||
    UUID.test(options.vercelResourceId) ||
    !/^[a-zA-Z0-9_-]+$/.test(options.vercelResourceId)
  ) {
    throw new Error(
      'vercelResourceId must be the Vercel integration resource ID, not a Nile database UUID.'
    );
  }
  if (
    !options.host ||
    isIP(options.host) !== 0 ||
    options.host.includes('/') ||
    options.host.includes(':') ||
    !options.databaseName ||
    !options.apiUrl ||
    (options.port !== undefined &&
      (!Number.isInteger(options.port) ||
        options.port < 1 ||
        options.port > 65535))
  ) {
    throw new Error(
      'A database DNS host, database name, API URL, and valid port are required.'
    );
  }

  // Capture the scope so mutating the caller's options cannot retarget a pool.
  const {
    loginId,
    databaseId,
    databaseName,
    vercelResourceId,
    host,
    apiUrl,
    ca,
  } = options;
  const port = options.port ?? 5432;
  const oauthBearerToken = (signal: AbortSignal) =>
    mintResourceToken(vercelResourceId, signal);
  const ssl = Object.freeze({
    rejectUnauthorized: true,
    ...(ca ? { ca } : {}),
  });
  registerConnectionGuard(oauthBearerToken, (config: NilePoolConfig) => {
    if (
      config.connectionString !== undefined ||
      !config.ssl ||
      typeof config.ssl !== 'object' ||
      config.ssl.rejectUnauthorized !== true ||
      config.ssl.ca !== ssl.ca ||
      config.ssl.checkServerIdentity !== undefined ||
      config.ssl.servername !== undefined ||
      config.user !== loginId ||
      config.oauthBearerToken !== oauthBearerToken ||
      config.password != null ||
      config.Client !== OAuthBearerClient ||
      config.host !== host ||
      config.port !== port ||
      config.database !== databaseName
    ) {
      throw new Error(
        'Vercel authentication requires its original database, login, oauthBearerToken provider, OAuthBearerClient, and certificate-verified TLS without a connectionString override.'
      );
    }
  });
  return {
    user: loginId,
    databaseId,
    databaseName,
    apiUrl,
    oauthBearerToken,
    db: { host, port, ssl, oauthBearerToken, Client: OAuthBearerClient },
  };
}

async function mintResourceToken(
  vercelResourceId: string,
  signal: AbortSignal
): Promise<string> {
  if (signal.aborted) {
    throw new Error('Vercel resource token request was cancelled.');
  }
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let onAbort!: () => void;
  const cancelled = new Promise<never>((_resolve, reject) => {
    onAbort = () => {
      controller.abort();
      reject(new Error('Vercel resource token request was cancelled.'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('Vercel resource token mint timed out.'));
    }, MINT_TIMEOUT_MS);
  });
  try {
    return await Promise.race([
      mint(vercelResourceId, controller.signal),
      timeout,
      cancelled,
    ]);
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', onAbort);
  }
}

async function mint(
  vercelResourceId: string,
  signal: AbortSignal
): Promise<string> {
  let workloadToken: string;
  try {
    workloadToken = await getVercelOidcToken();
  } catch {
    throw new Error(
      'Vercel workload identity is unavailable for this connection.'
    );
  }
  if (!workloadToken || signal.aborted) {
    throw new Error(
      'Vercel workload identity is unavailable for this connection.'
    );
  }
  let response: Response;
  try {
    response = await fetch(
      `https://api.vercel.com/v1/integrations/marketplace/resources/${encodeURIComponent(
        vercelResourceId
      )}/token`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${workloadToken}` },
        signal,
        redirect: 'error',
        cache: 'no-store',
      }
    );
  } catch {
    throw new Error('Vercel resource token mint failed.');
  }
  let body: unknown;
  try {
    body = JSON.parse(await readResponse(response));
  } catch {
    throw new Error('Vercel resource token mint returned an invalid response.');
  }
  if (!response.ok) {
    const error = (body as { error?: { code?: unknown } })?.error?.code;
    const code =
      typeof error === 'string' && /^[a-z_]{1,64}$/.test(error)
        ? ` (${error})`
        : '';
    throw new Error(
      `Vercel resource token mint denied: HTTP ${response.status}${code}.`
    );
  }
  const result = body as {
    token?: unknown;
    tokenType?: unknown;
    expiresIn?: unknown;
    expiresAt?: unknown;
  } | null;
  if (
    !result ||
    typeof result.token !== 'string' ||
    !result.token ||
    /\s/.test(result.token) ||
    result.tokenType !== 'bearer' ||
    typeof result.expiresIn !== 'number' ||
    !Number.isFinite(result.expiresIn) ||
    result.expiresIn <= 0 ||
    typeof result.expiresAt !== 'number' ||
    !Number.isSafeInteger(result.expiresAt) ||
    result.expiresAt <= Date.now()
  ) {
    throw new Error(
      'Vercel resource token mint returned invalid token or expiry fields.'
    );
  }
  return result.token;
}

async function readResponse(response: Response): Promise<string> {
  if (!response.body) {
    throw new Error('Empty token response.');
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let body = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        return body + decoder.decode();
      }
      size += value.byteLength;
      if (size > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new Error('Token response too large.');
      }
      body += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}
