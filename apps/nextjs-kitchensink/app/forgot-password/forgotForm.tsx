'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ResetResponse {
  ok: boolean;
  message?: string;
}

interface PasswordResetFormProps {
  action: (
    prevState: ResetResponse | null,
    formData: FormData
  ) => Promise<ResetResponse>;
}

export function ForgotPasswordForm({ action }: PasswordResetFormProps) {
  const [state, formAction, isPending] = useActionState<
    ResetResponse | null,
    FormData
  >(action, null);

  return (
    <form action={formAction} className="space-y-3">
      <div className="text-2xl mt-4">Forgot password</div>
      <div>
        <label htmlFor="password">Email </label>
        <Input
          id="email"
          name="email"
          required
          placeholder="Enter your email address"
        />
      </div>
      {state?.message && (
        <p
          className={`text-sm ${state.ok ? 'text-green-500' : 'text-red-500'}`}
        >
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Updating...' : 'Update'}
      </Button>
    </form>
  );
}
