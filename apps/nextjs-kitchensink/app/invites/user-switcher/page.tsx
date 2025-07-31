import { Google, SignInForm } from '@niledatabase/react';

export default async function InvitesUserSwitcher() {
  return (
    <div className="mx-auto container p-10 flex flex-col gap-20">
      The signed in user does not match the user that the invite was sent to.
      It&apos;s fine, its not a security problem, but your current user
      isn&apos;t going to have access to the tenant, since they were not the
      ones invited. You&apos;ll need to switch users in order to do that, so
      sign in with the invited user.
      <div>
        <Google />
      </div>
      <SignInForm />
    </div>
  );
}
