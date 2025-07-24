import { nile } from '../api/[...nile]/nile';

import { ForgotPasswordForm } from './forgotForm';

interface ResetResponse {
  ok: boolean;
  message?: string;
}

export default async function ForgotPasswordServer() {
  async function resetPassword(
    _: unknown,
    formData: FormData
  ): Promise<ResetResponse> {
    'use server';

    const email = formData.get('email') as string;
    const response = await nile.auth.forgotPassword({
      email,
      callbackUrl: `/reset-password/reset?email=${email}`,
    });

    if (response.ok) {
      return {
        ok: true,
        message: 'Check your email for instructions on resetting your password',
      };
    }

    const message = await response.text();
    return { ok: false, message };
  }

  return (
    <div className="w-2xl mx-auto p-10">
      <ForgotPasswordForm action={resetPassword} />
    </div>
  );
}
