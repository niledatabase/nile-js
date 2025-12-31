import React, { useEffect } from 'react';
import { mfa } from '@niledatabase/client';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

type RecoveryCodeFormProps = {
  token: string;
  scope: 'setup' | 'challenge';
  method: 'email' | 'authenticator';
  remove?: boolean;
  onSuccess?: (resultScope: 'setup' | 'challenge') => void;
  onCancel: () => void;
};

export default function RecoveryCodeForm({
  token,
  scope,
  method,
  remove,
  onSuccess,
  onCancel,
}: RecoveryCodeFormProps) {
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const errorId = React.useId();
  const timer = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCode('');
    setError(null);
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError('Missing MFA challenge token. Please restart the sign-in flow.');
      return;
    }

    const trimmed = code.trim();
    if (!trimmed.length) {
      setError('Enter your recovery code to continue.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await mfa({
        token,
        code: trimmed,
        scope,
        method,
        remove,
      });

      if (result?.ok) {
        setMessage(
          `You have ${result.recoveryCodesRemaining} recovery codes remaining.`
        );
        timer.current = setTimeout(() => {
          onSuccess?.(result.scope ?? scope);
        }, 2000);
        return;
      }

      if (result && typeof result === 'object' && 'url' in result) {
        const url = new URL(String(result.url));
        setError(url.searchParams.get('error'));
        return;
      }

      setError("We couldn't verify that recovery code. Please try again.");
    } catch (cause) {
      setError('We ran into a problem verifying the code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value);
    if (error) {
      setError(null);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <fieldset className="flex flex-col gap-6" disabled={isSubmitting}>
        <Input
          ref={inputRef}
          className="h-14"
          type="text"
          autoComplete="one-time-code"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          placeholder="Enter a recovery code"
          value={code}
          onChange={handleChange}
        />
        <Button
          className="w-full"
          type="submit"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Verifying...' : 'Submit'}
        </Button>
      </fieldset>
      <div className="flex justify-center">
        <Button
          type="button"
          variant="link"
          className="p-0 text-sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Use verification code instead
        </Button>
      </div>
      {error ? (
        <p
          className="text-sm font-medium text-destructive"
          id={errorId}
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm font-medium text-orange-600" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
