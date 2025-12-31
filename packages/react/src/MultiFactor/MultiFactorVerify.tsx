import * as React from 'react';
import { mfa } from '@niledatabase/client';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { cn } from '../../lib/utils';

import RecoveryCodeForm from './RecoveryCodeForm';

type MfaVerifyFormProps = {
  token: string;
  scope: 'setup' | 'challenge';
  method: 'email' | 'authenticator';
  remove?: boolean;
  onSuccess?: (scope: 'setup' | 'challenge') => void;
};

const CODE_LENGTH = 6;

export function MultiFactorVerify({
  token,
  scope,
  method,
  remove,
  onSuccess,
}: MfaVerifyFormProps) {
  const timer = React.useRef<NodeJS.Timeout>(undefined);
  const [values, setValues] = React.useState<string[]>(
    Array(CODE_LENGTH).fill('')
  );
  const [challengeToken, setChallengeToken] = React.useState(token);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showRecoveryInput, setShowRecoveryInput] = React.useState(false);
  const errorId = React.useId();

  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => {
    if (!showRecoveryInput) {
      inputRefs.current[0]?.focus();
    }
  }, [showRecoveryInput]);

  React.useEffect(() => {
    setChallengeToken(token);
  }, [token]);

  const handleInputChange =
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value.replace(/\D+/g, '');
      if (!raw.length) {
        updateValue(index, '');
        return;
      }
      const nextDigit = raw.at(-1) ?? '';
      updateValue(index, nextDigit);
      if (index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

  const handleKeyDown =
    (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Backspace') {
        if (values[index]) {
          updateValue(index, '');
        } else if (index > 0) {
          inputRefs.current[index - 1]?.focus();
          updateValue(index - 1, '');
        }
        event.preventDefault();
      }
      if (event.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus();
        event.preventDefault();
      }
      if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
        event.preventDefault();
      }
    };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D+/g, '')
      .slice(0, CODE_LENGTH)
      .split('');

    if (!pasted.length) {
      return;
    }

    const next = [...values];
    for (let i = 0; i < CODE_LENGTH; i += 1) {
      next[i] = pasted[i] ?? '';
    }
    setValues(next);

    const nextFocusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const updateValue = (index: number, digit: string) => {
    setValues((previous) => {
      const next = [...previous];
      next[index] = digit;
      return next;
    });
    setError(null);
    setSuccessMessage(null);
  };

  const code = React.useMemo(() => values.join(''), [values]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!challengeToken) {
      setError('Missing MFA challenge token. Please restart the sign-in flow.');
      return;
    }

    if (code.length !== CODE_LENGTH) {
      setError('Enter the full 6-digit code to continue.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await mfa({
        token: challengeToken,
        code,
        scope,
        method,
        remove,
      });
      if (result?.ok) {
        onSuccess?.(result.scope);
      } else {
        const url = new URL(result.url);
        setError(url.searchParams.get('error'));
      }
    } catch (cause) {
      setError('We ran into a problem verifying the code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);
  const handleDisableRecovery = () => {
    setShowRecoveryInput(false);
    setValues(Array(CODE_LENGTH).fill(''));
    setError(null);
    setSuccessMessage(null);
  };

  const handleEnableRecovery = async () => {
    if (showRecoveryInput) {
      return;
    }
    setError(null);
    setSuccessMessage(null);

    setShowRecoveryInput(true);
  };

  return (
    <div className="space-y-6">
      {showRecoveryInput ? (
        <RecoveryCodeForm
          token={challengeToken}
          scope={scope}
          method={method}
          remove={remove}
          onSuccess={onSuccess}
          onCancel={handleDisableRecovery}
        />
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <fieldset
            className="flex flex-col gap-6"
            disabled={isSubmitting || showRecoveryInput}
          >
            <div className="flex justify-center gap-3">
              {values.map((value, index) => (
                <Input
                  key={index}
                  ref={(node) => {
                    inputRefs.current[index] = node;
                  }}
                  className={cn(
                    'h-14 w-12 rounded-lg border border-input/80 bg-muted/40 text-center text-2xl font-medium tracking-[0.25em]',
                    'placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-primary/40'
                  )}
                  inputMode="numeric"
                  type="text"
                  autoComplete="one-time-code"
                  aria-label={`Digit ${index + 1}`}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  pattern="[0-9]*"
                  maxLength={1}
                  value={value}
                  onChange={handleInputChange(index)}
                  onKeyDown={handleKeyDown(index)}
                  onPaste={handlePaste}
                />
              ))}
            </div>
            <Button
              className="w-full"
              type="submit"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : 'Submit'}
            </Button>
          </fieldset>

          {error ? (
            <div className="flex flex-col gap-2">
              <p
                className="text-sm font-medium text-destructive"
                id={errorId}
                role="alert"
              >
                Error: {error}
              </p>
              <Button variant="outline">
                <a href="/mfa">Back to sign in</a>
              </Button>
            </div>
          ) : null}
        </form>
      )}
      {error === 'Invalid MFA code' ? (
        <Button variant="link">
          <a href="/mfa">Return to sign in</a>
        </Button>
      ) : null}
      {!showRecoveryInput && !error ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="link"
            className="p-0 text-sm"
            onClick={handleEnableRecovery}
            disabled={isSubmitting || showRecoveryInput}
          >
            Use a recovery code
          </Button>
        </div>
      ) : null}
      {successMessage ? (
        <p className="text-sm font-medium text-emerald-600" role="status">
          {successMessage}
        </p>
      ) : null}
    </div>
  );
}
