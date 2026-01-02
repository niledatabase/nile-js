import React from 'react';
import QRCode from 'react-qr-code';

import { AuthenticatorSetupProps } from './types';
import RecoverKeys from './RecoveryKeys';
import { MultiFactorVerify } from './MultiFactorVerify';

export function SetupAuthenticator({
  setup,
  onError,
  onSuccess,
}: AuthenticatorSetupProps) {
  // react-qr-code exposes both default and named exports; normalize for bundlers.
  const QRComponent = (QRCode as unknown as { default?: unknown }).default
    ? (QRCode as unknown as { default: typeof QRCode }).default
    : QRCode;

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {setup.otpauthUrl ? (
        <>
          <div className="rounded-md border border-border bg-background p-3">
            <QRComponent
              value={setup.otpauthUrl}
              size={192}
              className="h-48 w-48"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Scan the code with your authenticator app, then enter the 6-digit
            code below.
          </p>
        </>
      ) : null}

      {setup.recoveryKeys ? (
        <RecoverKeys setup={setup} onError={onError} onSuccess={onSuccess} />
      ) : null}

      <MultiFactorVerify
        token={setup.token}
        scope={setup.scope}
        method={setup.method}
        onSuccess={onSuccess}
      />
    </div>
  );
}
