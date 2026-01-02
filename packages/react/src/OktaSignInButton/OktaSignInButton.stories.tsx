import React from 'react';

import OktaSignInButton from './index';

const meta = {
  title: 'Social/Okta',
  component: OktaSignInButton,
};

export default meta;

export function OktaSSO() {
  return (
    <div className="flex flex-col items-center">
      <OktaSignInButton />
    </div>
  );
}
