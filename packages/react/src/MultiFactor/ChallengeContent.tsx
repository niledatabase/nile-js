import React from 'react';

import { MultiFactorVerify } from './MultiFactorVerify';
import { MfaSetup } from './types';

export function ChallengeContent({
  payload,
  message,
  isEnrolled,
  onSuccess,
}: {
  payload: MfaSetup;
  message?: string;
  isEnrolled?: boolean;
  onSuccess?: (scope: 'setup' | 'challenge') => void;
}) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <MultiFactorVerify
        token={payload.token}
        scope={payload.scope}
        method={payload.method}
        remove={isEnrolled}
        onSuccess={onSuccess}
      />
    </div>
  );
}
