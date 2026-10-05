import type { PoolConfig } from 'pg';

import type { NilePoolConfig, OAuthBearerTokenProvider } from '../types';

type PasswordCallback = () => string | Promise<string>;
export type ConnectionGuard = (config: NilePoolConfig) => void;

// A provider can require properties that pg must retain when creating a connection.
// Generic password callbacks do not acquire provider-specific restrictions.
const guardKey = Symbol.for('@niledatabase/server/connection-guard');
type GuardedPassword = (PasswordCallback | OAuthBearerTokenProvider) & {
  [guardKey]?: ConnectionGuard;
};

export function registerConnectionGuard(
  password: PasswordCallback | OAuthBearerTokenProvider,
  guard: ConnectionGuard
) {
  // Both package entries are bundled independently. The marker travels with the
  // callback, including when the helper and the main SDK use separate bundles.
  Object.defineProperty(password, guardKey, { value: guard });
}

export function getConnectionGuard(
  password: PoolConfig['password'] | OAuthBearerTokenProvider
) {
  return typeof password === 'function'
    ? (password as GuardedPassword)[guardKey]
    : undefined;
}
