import React from 'react';

import GoogleLoginButton from './GoogleLoginButton';

const meta = {
  title: 'Social/Google',
  component: GoogleLoginButton,
};

export default meta;

export function GoogleSSO() {
  return (
    <div className="flex flex-col items-center">
      <GoogleLoginButton />
    </div>
  );
}
