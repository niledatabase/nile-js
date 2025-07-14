'use client';

import '@niledatabase/react/styles.css';
import { useForm } from 'react-hook-form';
import { useActionState, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

export type ServerResponse = {
  ok: boolean;
  message?: string;
};

type Props = {
  action: (
    prevState: ServerResponse | null,
    formData: FormData
  ) => Promise<ServerResponse>;
};
export default function VerifyEmailForm({ action }: Props) {
  const [show, setShow] = useState(false);
  const timer = useRef<NodeJS.Timeout>(null);
  const form = useForm();
  const [state, formAction, pending] = useActionState<
    ServerResponse | null,
    FormData
  >(action, {
    message: '',
    ok: true,
  });

  useEffect(() => {
    setShow(true);
    timer.current = setTimeout(() => {
      setShow(false);
    }, 8000);
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [pending]);

  return (
    <div className="container mx-auto pt-40 flex gap-20 flex-col max-w-3xl">
      <Form {...form}>
        <form action={formAction} className="flex flex-col gap-3">
          <span
            className={`${state?.ok ? 'text-green-500' : 'text-red-500'} ${
              show ? 'opacity-100' : 'opacity-0'
            } transition-all`}
          >
            {state?.message}
          </span>
          <div>
            <Button type="submit" size="lg" disabled={pending}>
              Send verification email
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
