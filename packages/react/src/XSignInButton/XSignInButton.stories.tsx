import React from 'react';

import Button from './index';

const meta = {
  title: 'Social/X',
  component: Button,
};

export default meta;

export function XSSO() {
  return (
    <div className="flex flex-col items-center">
      <Button />
    </div>
  );
}
