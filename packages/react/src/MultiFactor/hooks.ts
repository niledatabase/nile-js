import { mfa } from '@niledatabase/client';
import { useState, useEffect, useCallback } from 'react';

import {
  MfaSetup,
  UseMfaEnrollmentOptions,
  UseMfaEnrollmentResult,
  ChallengeRedirect,
  EnrollmentError,
} from './types';
import {
  isRecord,
  parseAuthenticatorResponse,
  parseEmailResponse,
} from './utils';

export const useMultiFactor = ({
  method,
  currentMethod,
  onRedirect,
  onChallengeRedirect,
}: UseMfaEnrollmentOptions): UseMfaEnrollmentResult<MfaSetup> => {
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [errorType, setErrorType] = useState<EnrollmentError>(null);
  const [isStartingSetup, setIsStartingSetup] = useState(false);
  const [isRequestingDisable, setIsRequestingDisable] = useState(false);
  const parseResponse =
    method === 'authenticator'
      ? parseAuthenticatorResponse
      : parseEmailResponse;
  const navigate = useCallback(
    (url: string) => {
      if (onRedirect) {
        onRedirect(url);
        return;
      }
      if (typeof window !== 'undefined') {
        window.location.assign(url);
      }
    },
    [onRedirect]
  );

  const redirectToPrompt = useCallback(
    (params: ChallengeRedirect) => {
      if (onChallengeRedirect) {
        onChallengeRedirect(params);
        return;
      }

      const searchParams = new URLSearchParams({
        token: params.token,
        method: params.method,
        scope: params.scope,
      });

      if (params.destination) {
        searchParams.set('destination', params.destination);
      }

      navigate(`/mfa/prompt?${searchParams.toString()}`);
    },
    [navigate, onChallengeRedirect]
  );

  const startSetup = useCallback(async () => {
    setIsStartingSetup(true);
    setErrorType(null);
    try {
      const response = await mfa({ scope: 'setup', method });

      const redirectUrl = getRedirectUrl(response);
      if (redirectUrl) {
        navigate(redirectUrl);
        return;
      }

      const parsed = parseResponse(response);
      if (!parsed) {
        setSetup(null);
        setErrorType('parseSetup');
        return;
      }

      if (parsed.scope === 'challenge') {
        redirectToPrompt({
          token: parsed.token,
          method: parsed.method,
          scope: parsed.scope,
          destination: 'maskedEmail' in parsed ? parsed.maskedEmail : undefined,
        });
        return;
      }

      setSetup(parsed);
    } catch (cause) {
      setErrorType('setup');
      setSetup(null);
    } finally {
      setIsStartingSetup(false);
    }
  }, [method, navigate, parseResponse, redirectToPrompt]);

  const startDisable = useCallback(async () => {
    setIsRequestingDisable(true);
    setErrorType(null);
    try {
      const response = await mfa({ method });

      const redirectUrl = getRedirectUrl(response);
      if (redirectUrl) {
        navigate(redirectUrl);
        return;
      }

      const parsed = parseResponse(response);
      if (!parsed) {
        setErrorType('parseDisable');
        return;
      }

      setSetup(parsed);
    } catch (cause) {
      setErrorType('disable');
    } finally {
      setIsRequestingDisable(false);
    }
  }, [method, navigate, parseResponse]);

  useEffect(() => {
    setErrorType(null);
    setSetup(null);
    return () => {
      setSetup(null);
    };
  }, [currentMethod]);

  return {
    setup,
    loading: isStartingSetup || isRequestingDisable,
    errorType,
    startSetup,
    startDisable,
  };
};

const getRedirectUrl = (value: unknown): string | null => {
  if (isRecord(value) && typeof value.url === 'string') {
    return value.url;
  }

  if (value instanceof Response && typeof value.url === 'string') {
    return value.url;
  }

  return null;
};
