'use client';

import { SignInForm, SignUpForm } from '@niledatabase/react';
import { useState } from 'react';

export default function SignInSignOut({
  revalidate,
}: {
  revalidate: () => void;
}) {
  const [msg, setMsg] = useState({ kind: '', msg: '' });
  return (
    <div className="flex flex-col items-center">
      <div
        className={`${
          msg.kind === 'error' ? 'bg-red-900' : 'bg-green-700'
        } text-white p-2 rounded-lg ${
          msg.msg ? 'opacity-100' : 'opacity-0'
        } flex-1`}
      >
        {msg.msg}
      </div>
      <div className="w-3xl flex flex-col gap-20">
        <SignUpForm
          createTenant
          redirect={false}
          onError={(e) => {
            setMsg({ kind: 'error', msg: e.message });
          }}
          onSuccess={() => {
            revalidate();
            setMsg({ kind: 'success', msg: 'Sign up success!' });
          }}
        />
        <SignInForm
          redirect={false}
          onError={(e) => {
            setMsg({ kind: 'error', msg: e.message });
          }}
          onSuccess={() => {
            revalidate();
            setMsg({ kind: 'success', msg: 'Sign in success!' });
          }}
        />
      </div>
    </div>
  );
}
