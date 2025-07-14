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

export function PasswordResetForm({ action }: PasswordResetFormProps) {
  const [state, formAction, isPending] = useActionState<
    ResetResponse | null,
    FormData
  >(action, null);

  return (
    <form action={formAction} className="space-y-3">
      <div className="text-2xl mt-4">Reset password form</div>
      <div>
        <label htmlFor="password">Password</label>
        <Input
          id="password"
          name="password"
          required
          placeholder="Enter your new password"
          type="password"
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
