import React from 'react';

import Button from './index';

const meta = {
  title: 'Social/LinkedIn',
  component: Button,
};

export default meta;

export function LinkedInSSO() {
  return (
    <div className="flex flex-col items-center">
      <Button />
    </div>
  );
}
