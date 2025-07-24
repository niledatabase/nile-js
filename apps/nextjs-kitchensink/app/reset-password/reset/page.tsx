import ResetPasswordClientSide from '../client';

export default async function ResetPasswordFromEmail({
  searchParams,
}: {
  searchParams: Promise<{ email: string }>;
}) {
  const email = (await searchParams).email;
  return (
    <div className="mx-auto container">
      <div className="p-10 flex flex-col gap-2">
        <div className="text-7xl">Congratulations!</div>
        <div>
          You made it to the password reset page! This page only works client
          side, because there is a temporary signed cookie that can be exchanged
          for setting a new password.
        </div>
        <div>
          This means if you made it to this page without that reset token, you
          won&apos;t be able to reset your password in this way... unless you
          are signed in, in which case, resetting your password will work.
        </div>
        <div>
          One thing to note here is that passwords are currently stored as JWTs,
          so when you reset your password, that old JWT isn&apos;t invalidated,
          since we don&apos;t know what it is! This is one of the many reasons
          to use SSO over credentials.
        </div>
        <ResetPasswordClientSide email={email} />
      </div>
    </div>
  );
}
