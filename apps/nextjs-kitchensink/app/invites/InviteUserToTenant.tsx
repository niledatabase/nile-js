'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ServerResponse = {
  ok: boolean;
  message?: string;
};

type Props = {
  action: (
    prevState: ServerResponse | null,
    formData: FormData
  ) => Promise<ServerResponse>;
};

export function InviteUserToTenant({ action }: Props) {
  const [state, formAction, isPending] = useActionState<
    ServerResponse | null,
    FormData
  >(action, null);

  return (
    <form action={formAction} className="space-y-3 w-full">
      <div className="flex flex-row items-center py-2 gap-2">
        <Input
          id="email"
          name="email"
          required
          placeholder="Invite user eg, user@example.com"
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Sending mail...' : 'Invite user'}
        </Button>
      </div>
      {state?.message && (
        <p
          className={`text-sm ${state.ok ? 'text-green-500' : 'text-red-500'}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
