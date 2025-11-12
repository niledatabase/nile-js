import React from 'react';

import { EmailSetup } from './types';
import { MultiFactorVerify } from './MultiFactorVerify';

export function SetupEmail({
  setup,
  onSuccess,
}: {
  setup: EmailSetup;
  onSuccess: (scope: 'setup' | 'challenge') => void;
}) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
      <p className="text-sm text-muted-foreground">
        {setup.maskedEmail
          ? `We sent a 6-digit code to ${setup.maskedEmail}. Enter it below to finish.`
          : 'Check your email for a 6-digit code and enter it below to finish.'}
      </p>
      <MultiFactorVerify
        token={setup.token}
        scope={setup.scope}
        method={setup.method}
        onSuccess={onSuccess}
      />
    </div>
  );
}
