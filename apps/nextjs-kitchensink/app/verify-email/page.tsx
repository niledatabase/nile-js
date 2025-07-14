import { revalidatePath } from 'next/cache';

import { nile } from '../api/[...nile]/nile';

import VerifyEmail from './VerifyEmail';
import UnVerifyEmail from './UnVerifyEmail';

import Code from '@/components/ui/code';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function VerifyEmailPage() {
  return (
    <div className="container mx-auto p-10 flex flex-col gap-10">
      <div className="text-7xl">Verify email</div>
      <div className="flex flex-row justify-center w-full gap-2">
        <div className="w-3xl mx-auto flex flex-col gap-3">
          <VerifyEmail />
          <UnVerifyEmail action={unVerifyEmail} />
        </div>
      </div>
      <div>
        On this page, we show the user&apos;s profile. We create a simple action
        that allows an email to be sent to verify their email address. Upon
        returning to this page (via the link in the email), the checkbox beside
        the email on the user profile will go from transparent to green, meaning
        we have a verified email address.
      </div>
      <div>
        One thing to be aware of, is that you can only verify the current
        user&apos;s email via the API. It does not make much sense to verify an
        email address of a user who does not have an account, or the email of a
        user who isn&apos;t &lsquo;you&rsquo;. When a user is invited to a
        tenant or signs in with their email address, that will set their email
        address as verified.
      </div>
      <Tabs defaultValue="page">
        <TabsList>
          <TabsTrigger value="page">
            app/verify-email/VerifyEmail.tsx
          </TabsTrigger>
          <TabsTrigger value="form">
            app/verify-email/VerifyEmailForm.tsx
          </TabsTrigger>
        </TabsList>
        <TabsContent value="page">
          This component contains the form and the action for sending the
          verification email. We want to come back to this page, so we manually
          set the callbackUrl in the call.
          <Code file="app/verify-email/VerifyEmail.tsx" />
        </TabsContent>
        <TabsContent value="form">
          All form boiler plate code, nothing interesting to see here at all.
          <Code file="app/verify-email/VerifyEmailForm.tsx" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function unVerifyEmail() {
  'use server';
  const me = await nile.users.getSelf();
  if (me instanceof Response) {
    return {
      ok: false,
      error: 'Not logged in',
    };
  }
  await nile.db.query(
    'update users.users set email_verified = NULL where id = $1',
    [me.id]
  );
  revalidatePath('/verify-email');
  return { ok: true };
}
