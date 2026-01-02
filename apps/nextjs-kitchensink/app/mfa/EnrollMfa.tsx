'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AuthenticatorSetup,
  EmailSetup,
  EnrollmentError,
  EnrollMfaProps,
  MfaMethod,
  useMultiFactor,
  ChallengeRedirect,
  MultiFactorAuthenticator,
  MultiFactorEmail,
  MultiFactorChallenge,
} from '@niledatabase/react';
import { useRouter } from 'next/navigation';

import { Button } from '../../components/ui/button';

export type MfaEnrollmentSectionProps = {
  method: MfaMethod;
  currentMethod: MfaMethod | null;
  onRedirect?: (url: string) => void;
  onChallengeRedirect?: (params: ChallengeRedirect) => void;
};

function MfaEnrollmentSection({
  method,
  currentMethod,
  onRedirect,
  onChallengeRedirect,
}: MfaEnrollmentSectionProps) {
  const isAuthenticator = method === 'authenticator';
  const timer = useRef<NodeJS.Timeout>(undefined);
  const { setup, loading, errorType, startSetup, startDisable } =
    useMultiFactor({
      method,
      currentMethod,
      onRedirect,
      onChallengeRedirect,
    });
  const isEnrolled = currentMethod === method;
  const hasDifferentMethod = currentMethod !== null && currentMethod !== method;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!errorType) {
      return;
    }

    const setupFailure = isAuthenticator
      ? 'We ran into a problem starting authenticator setup. Please retry.'
      : 'We ran into a problem sending the email code. Please retry.';

    const parseSetupFailure = isAuthenticator
      ? "We couldn't start the authenticator setup. Please try again."
      : "We couldn't start the email MFA setup. Please try again.";

    const disableFailure =
      'We ran into a problem starting the removal flow. Please retry.';
    const parseDisableFailure =
      "We couldn't start the removal challenge. Please try again.";

    const messages: Record<Exclude<EnrollmentError, null>, string> = {
      setup: setupFailure,
      disable: disableFailure,
      parseSetup: parseSetupFailure,
      parseDisable: parseDisableFailure,
    };

    setErrorMessage(messages[errorType]);
  }, [errorType, isAuthenticator]);

  const friendlyMethod = isAuthenticator ? 'authenticator' : 'email';
  const headerTitle = `${
    isAuthenticator ? 'Authenticator' : 'Email'
  } verification`;
  const description = isAuthenticator
    ? 'Scan a QR code with your authenticator app and enter a 6-digit code to finish.'
    : 'Receive a one-time code over email and enter it to complete setup.';
  const startLabel = `Enable ${friendlyMethod} MFA`;
  const startPendingLabel = isAuthenticator
    ? 'Starting setup...'
    : 'Sending code...';
  const disableLabel = `Disable ${friendlyMethod} MFA`;
  const disablePendingLabel = 'Starting removal...';
  const blockerMessage = `Disable your current MFA method before enabling ${friendlyMethod}.`;
  const challengeMessage = isAuthenticator
    ? 'Enter a code from your authenticator app to confirm this action.'
    : 'Enter the 6-digit code we just emailed you to confirm this action.';

  const handleStart = async () => {
    setErrorMessage(null);
    await startSetup();
  };

  const router = useRouter();
  const handleDisable = async () => {
    setErrorMessage(null);
    await startDisable();
  };
  const redirect = useCallback(
    (scope: 'setup' | 'challenge') => {
      timer.current = setTimeout(() => {
        if (scope === 'setup') {
          window.location.reload();
        } else {
          router.push('/mfa');
        }
      }, 1500);
    },
    [router]
  );
  useEffect(() => {
    () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);
  return (
    <div className="flex w-full flex-col items-center gap-6 rounded-xl border border-border/60 bg-card/60 p-6">
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-semibold">{headerTitle}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {isEnrolled ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p>You are currently enrolled with this method.</p>
          <Button disabled={loading} onClick={handleDisable}>
            {loading ? disablePendingLabel : disableLabel}
          </Button>
        </div>
      ) : hasDifferentMethod ? (
        <p className="text-sm text-muted-foreground">{blockerMessage}</p>
      ) : (
        <Button size="lg" disabled={loading} onClick={handleStart}>
          {loading ? startPendingLabel : startLabel}
        </Button>
      )}

      {setup?.scope === 'setup' ? (
        isAuthenticator ? (
          <MultiFactorAuthenticator
            setup={setup as AuthenticatorSetup}
            onError={setErrorMessage}
            onSuccess={redirect}
          />
        ) : (
          <MultiFactorEmail setup={setup as EmailSetup} onSuccess={redirect} />
        )
      ) : null}

      {setup?.scope === 'challenge' ? (
        <MultiFactorChallenge
          payload={setup}
          message={challengeMessage}
          isEnrolled={isEnrolled}
          onSuccess={redirect}
        />
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-destructive text-center">{errorMessage}</p>
      ) : null}
    </div>
  );
}

export default function EnrollMfa({
  enrolled,
  enrolledMethod,
  onRedirect,
  onChallengeRedirect,
}: EnrollMfaProps) {
  let currentMethod: MfaMethod | null = null;
  if (enrolledMethod === 'authenticator' || enrolledMethod === 'email') {
    currentMethod = enrolledMethod;
  } else if (enrolled) {
    currentMethod = 'authenticator';
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <MfaEnrollmentSection
        method="authenticator"
        currentMethod={currentMethod}
        onRedirect={onRedirect}
        onChallengeRedirect={onChallengeRedirect}
      />

      <MfaEnrollmentSection
        method="email"
        currentMethod={currentMethod}
        onRedirect={onRedirect}
        onChallengeRedirect={onChallengeRedirect}
      />
    </div>
  );
}
