import {
  Google,
  PasswordResetRequestForm,
  SignInForm,
} from '@niledatabase/react';

export default async function InvitesSignUpPage() {
  return (
    <div className="mx-auto container p-10 flex flex-col gap-20">
      Looks like you&apos;re new around these parts. Someone must like you.
      Before you can see all the super cool stuff they have in store,
      you&apos;ll need an account. The easiest way is to use google.
      <div>
        <Google callbackUrl="/invites" />
      </div>
      <div>
        You may be some random email address we don&apos;t know about, so you
        can use that too, but you&apos;ll probably need to set a password.
        <PasswordResetRequestForm />
      </div>
      <div>
        If you&apos;ve done this all before, sign back in.
        <SignInForm callbackUrl="/invites" />
      </div>
    </div>
  );
}
