import { AuthenticatorSetup, ChallengeScope, EmailSetup } from './types';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const isScope = (value: unknown): value is ChallengeScope =>
  value === 'setup' || value === 'challenge';

export const parseRecoveryKeys = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const keys = value.filter(
    (key): key is string => typeof key === 'string' && key.trim().length > 0
  );

  return keys.length > 0 ? keys : undefined;
};

export const parseAuthenticatorResponse = (
  value: unknown
): AuthenticatorSetup | null => {
  if (!isRecord(value) || value.method !== 'authenticator') {
    return null;
  }

  if (!isScope(value.scope) || typeof value.token !== 'string') {
    return null;
  }

  return {
    method: 'authenticator',
    token: value.token,
    scope: value.scope,
    otpauthUrl:
      typeof value.otpauthUrl === 'string' ? value.otpauthUrl : undefined,
    secret: typeof value.secret === 'string' ? value.secret : undefined,
    recoveryKeys: parseRecoveryKeys(value.recoveryKeys),
  };
};

export const parseEmailResponse = (value: unknown): EmailSetup | null => {
  if (!isRecord(value) || value.method !== 'email') {
    return null;
  }

  if (!isScope(value.scope) || typeof value.token !== 'string') {
    return null;
  }

  return {
    method: 'email',
    token: value.token,
    scope: value.scope,
    maskedEmail:
      typeof value.maskedEmail === 'string' &&
      value.maskedEmail.trim().length > 0
        ? value.maskedEmail
        : undefined,
  };
};
