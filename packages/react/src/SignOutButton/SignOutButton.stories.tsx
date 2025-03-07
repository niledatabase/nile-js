import React from 'react';

import Button from './index';

const meta = {
  title: 'Sign Out Button',
  component: Button,
};

export default meta;

export function SignOutButton() {
  return (
    <div className="flex flex-col items-center">
      <Button />
    </div>
  );
}
