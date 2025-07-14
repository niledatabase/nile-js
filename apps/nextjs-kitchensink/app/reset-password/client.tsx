'use client';
import { PasswordResetForm, UserInfo } from '@niledatabase/react';
import { useState } from 'react';

// Need the email in order to reset
export default function ResetPasswordClientSide({ email }: { email: string }) {
  const [success, setSuccess] = useState(false);
  return (
    <div className="w-2xl mx-auto p-10">
      <UserInfo />
      <PasswordResetForm
        defaultValues={{ email }}
        onSuccess={() => {
          setSuccess(true);
        }}
      />
      <div
        className={`text-2xl text-green-500 ${
          success ? 'opacity-100' : 'opacity-0'
        } transition-opacity`}
      >
        Password updated
      </div>
    </div>
  );
}
