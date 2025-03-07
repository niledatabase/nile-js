import React from 'react';

import EmailSignIn from './Form';
import EmailSignInButton from './EmailSignInButton';

const meta = {
  title: 'Social/Email',
  component: EmailSignIn,
};

export default meta;

export function SignInWithEmail() {
  return (
    <div className="flex flex-col items-center">
      <EmailSignIn
        onSuccess={() => {
          // noop
        }}
      />
    </div>
  );
}

export function VerifyEmailAddress() {
  return (
    <div className="flex flex-col gap-4">
      Hello user, before you continue, you need to verify your email address.
      <div>
        <EmailSignInButton
          email="example@example.com"
          callbackUrl="http://example.com/verified"
          className="w-fit"
          onSent={() => {
            // do something
          }}
          onFailure={(e) => {
            alert(e?.error);
          }}
        >
          Verify my email address
        </EmailSignInButton>
      </div>
    </div>
  );
}
