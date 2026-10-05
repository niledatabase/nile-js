import { TLSSocket } from 'tls';

import pg from 'pg';

import type { NilePoolConfig, OAuthBearerTokenProvider } from '../types';
import { getConnectionGuard } from '../utils/connection-guard';

const clientKey = Symbol.for('@niledatabase/server/oauth-bearer-client');

// pg 8.16.3 binds these per-client authentication handlers in _attachListeners.
// The dependency is pinned because these hooks and the SASL send methods are internal.
type InternalClient = {
  _connecting: boolean;
  _connectionError: boolean;
  _handleReadyForQuery(): void;
  _handleErrorEvent(error: Error): void;
  _handleErrorMessage(error: Error): void;
  connectionParameters: Record<string, unknown>;
};
type SASLConnection = pg.Connection & {
  ssl: unknown;
  sendSASLInitialResponseMessage(mechanism: string, response: string): void;
  sendSCRAMClientFinalMessage(response: string): void;
};
const parent = pg.Client.prototype as unknown as InternalClient;

export function assertOAuthBearerConfig(config: NilePoolConfig) {
  if (typeof config.oauthBearerToken !== 'function') {
    throw new Error('OAUTHBEARER requires an oauthBearerToken provider.');
  }
  if (config.password != null || config.connectionString != null) {
    throw new Error(
      'OAUTHBEARER cannot use password or connectionString authentication.'
    );
  }
  if (
    !config.ssl ||
    typeof config.ssl !== 'object' ||
    config.ssl.rejectUnauthorized !== true ||
    config.ssl.checkServerIdentity ||
    config.ssl.servername ||
    // A supplied pg Connection can bypass pg's TLS setup entirely.
    'connection' in config
  ) {
    throw new Error(
      'OAUTHBEARER requires certificate-verified TLS without verification overrides.'
    );
  }
  if (
    config.Client &&
    !(config.Client as typeof OAuthBearerClient)[clientKey]
  ) {
    throw new Error('OAUTHBEARER requires OAuthBearerClient.');
  }
  getConnectionGuard(config.oauthBearerToken)?.(config);
}

/** PostgreSQL 18 / RFC 7628 OAUTHBEARER with a pre-minted token provider. */
export class OAuthBearerClient extends pg.Client {
  static readonly [clientKey] = true;
  #provider?: OAuthBearerTokenProvider;
  #abort = new AbortController();
  #state: 'new' | 'minting' | 'sent' | 'failed' | 'authenticated' | 'retired' =
    'new';
  #configurationError?: Error;
  #handledError = false;

  constructor(config: NilePoolConfig = {}) {
    // Keep token providers out of pg's password machinery, including PGPASSWORD.
    const effective = {
      ...config,
      ssl: typeof config.ssl === 'object' ? { ...config.ssl } : config.ssl,
    };
    super(effective);
    this.#provider = config.oauthBearerToken;
    this.password = undefined;
    const internal = this as unknown as InternalClient;
    internal.connectionParameters.password = undefined;
    try {
      assertOAuthBearerConfig(config);
    } catch (error) {
      this.#configurationError = error as Error;
    }
    Object.freeze(effective.ssl);
    for (const key of ['user', 'database', 'host', 'port', 'password', 'ssl']) {
      Object.defineProperty(this, key, {
        writable: false,
        configurable: false,
      });
      Object.defineProperty(internal.connectionParameters, key, {
        writable: false,
        configurable: false,
      });
    }
    Object.defineProperty(this, 'connection', {
      writable: false,
      configurable: false,
    });
    Object.defineProperty(this.connection, 'ssl', {
      writable: false,
      configurable: false,
    });
    this.connection.once('end', () => this.#retire());
    this.connection.on('authenticationOk', () => {
      if (this.#state === 'sent') {
        this.#state = 'authenticated';
      } else if (this.#state !== 'retired') {
        this.#fail(new Error('OAUTHBEARER authentication was not completed.'));
      }
    });
  }

  connect(): Promise<void>;
  connect(callback: (error: Error) => void): void;
  connect(callback?: (error: Error) => void): Promise<void> | void {
    if (this.#configurationError) {
      if (callback) {
        process.nextTick(callback, this.#configurationError);
        return;
      }
      return Promise.reject(this.#configurationError);
    }
    return callback ? super.connect(callback) : super.connect();
  }

  _handleAuthCleartextPassword() {
    this.#fail(
      new Error(
        'OAUTHBEARER is required; password authentication was rejected.'
      )
    );
  }

  _handleAuthMD5Password() {
    this._handleAuthCleartextPassword();
  }

  _handleAuthSASL(message: { mechanisms: string[] }) {
    if (this.#state === 'retired') return;
    if (this.#state !== 'new' || !message.mechanisms.includes('OAUTHBEARER')) {
      this.#fail(
        new Error('The server must advertise OAUTHBEARER authentication.')
      );
      return;
    }
    const socket = this.connection.stream;
    if (
      !(socket instanceof TLSSocket) ||
      !socket.encrypted ||
      !socket.authorized ||
      socket.destroyed
    ) {
      this.#fail(new Error('OAUTHBEARER requires certificate-verified TLS.'));
      return;
    }
    this.#state = 'minting';
    const provider = this.#provider as OAuthBearerTokenProvider;
    Promise.resolve()
      .then(() =>
        this.#abort.signal.aborted ? undefined : provider(this.#abort.signal)
      )
      .then((token) => {
        if (this.#abort.signal.aborted) return;
        if (
          socket !== this.connection.stream ||
          socket.destroyed ||
          !socket.authorized
        ) {
          this.#fail(
            new Error(
              'OAUTHBEARER connection was retired before authentication.'
            )
          );
          return;
        }
        if (
          typeof token !== 'string' ||
          !/^[-A-Za-z0-9._~+/]+=*$/.test(token)
        ) {
          this.#fail(
            new Error('OAUTHBEARER provider returned an invalid bearer token.')
          );
          return;
        }
        this.#state = 'sent';
        // No authzid or channel binding: PG18 accepts the canonical GS2 n,, header.
        (this.connection as SASLConnection).sendSASLInitialResponseMessage(
          'OAUTHBEARER',
          `n,,\x01auth=Bearer ${token}\x01\x01`
        );
      })
      .catch(() => {
        if (!this.#abort.signal.aborted) {
          this.#fail(new Error('OAUTHBEARER token acquisition failed.'));
        }
      });
  }

  _handleAuthSASLContinue(message: { data: string }) {
    if (this.#state === 'retired') return;
    if (this.#state !== 'sent' || !message.data) {
      this.#fail(new Error('Unexpected OAUTHBEARER authentication challenge.'));
      return;
    }
    // RFC7628 errors are acknowledged with one byte, not an empty response.
    // Never surface server JSON or its eventual ErrorResponse during authentication.
    this.#state = 'failed';
    (this.connection as SASLConnection).sendSCRAMClientFinalMessage('\x01');
  }

  _handleAuthSASLFinal() {
    this.#fail(new Error('Unexpected OAUTHBEARER SASL final message.'));
  }

  _handleReadyForQuery() {
    if (this.#state === 'authenticated') {
      parent._handleReadyForQuery.call(this);
    } else if (this.#state !== 'retired') {
      this.#fail(new Error('OAUTHBEARER authentication was not completed.'));
    }
  }

  _handleErrorMessage(error: Error & { code?: string }) {
    if (this.#state === 'authenticated') {
      parent._handleErrorMessage.call(this, error);
    } else {
      const failure = new Error('OAUTHBEARER authentication failed.');
      if (typeof error.code === 'string' && /^[A-Z0-9]{5}$/.test(error.code)) {
        Object.assign(failure, { code: error.code });
      }
      this.#fail(failure);
    }
  }

  _handleErrorEvent(error: Error) {
    const sanitized =
      this.#state === 'minting' ||
      this.#state === 'sent' ||
      this.#state === 'failed'
        ? new Error('OAUTHBEARER authentication failed.')
        : error;
    this.#fail(sanitized);
  }

  #fail(error: Error) {
    if (this.#handledError) return;
    this.#handledError = true;
    this.#retire();
    parent._handleErrorEvent.call(this, error);
    this.connection.stream.destroy();
  }

  #retire() {
    this.#state = 'retired';
    this.#abort.abort();
  }

  end(): Promise<void>;
  end(callback: (error: Error) => void): void;
  end(callback?: (error: Error) => void): Promise<void> | void {
    if (
      this.#state !== 'authenticated' &&
      (this as unknown as InternalClient)._connecting
    ) {
      this.#fail(new Error('OAUTHBEARER connection was cancelled.'));
    }
    this.#retire();
    return callback ? super.end(callback) : super.end();
  }
}
