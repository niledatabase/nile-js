import React from 'react';
import { Copy, Download } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

import { Button } from '../../components/ui/button';

import { CopyState, AuthenticatorSetupProps } from './types';

export default function RecoverKeys({
  setup,
  onError,
}: AuthenticatorSetupProps) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const recoveryText = useMemo(
    () => setup.recoveryKeys?.join('\n') ?? '',
    [setup.recoveryKeys]
  );
  useEffect(() => {
    setCopyState('idle');
  }, [setup.token]);
  return (
    <div className="mt-4 flex w-full flex-col items-center gap-3 text-left">
      <div className="w-full max-w-sm space-y-2">
        <p className="text-sm font-medium">Recovery codes</p>
        <p className="text-xs text-muted-foreground">
          Store these somewhere safe. Use one if you lose your authenticator
          device.
        </p>
        <div className="rounded-md border border-dashed bg-muted/30 p-4">
          <ul className="grid gap-2 font-mono text-sm">
            {setup.recoveryKeys?.map((key) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={async () => {
              if (!recoveryText) {
                return;
              }

              if (!('clipboard' in navigator)) {
                setCopyState('error');
                return;
              }

              try {
                await navigator.clipboard.writeText(recoveryText);
                setCopyState('copied');
              } catch (cause) {
                setCopyState('error');
              }
            }}
          >
            <Copy className="size-4" aria-hidden="true" />
            Copy
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              if (!recoveryText) {
                return;
              }

              try {
                const header = 'Nile MFA recovery codes\n\n';
                const blob = new Blob([header, recoveryText], {
                  type: 'text/plain',
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'nile-mfa-recovery-codes.txt';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              } catch (cause) {
                onError(
                  'We were unable to download the recovery keys. Please try again.'
                );
              }
            }}
          >
            <Download className="size-4" aria-hidden="true" />
            Download
          </Button>
          {copyState === 'copied' ? (
            <span className="text-xs text-muted-foreground">
              Recovery codes copied to clipboard.
            </span>
          ) : copyState === 'error' ? (
            <span className="text-xs text-destructive">
              Unable to copy automatically. Please copy the codes manually.
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
