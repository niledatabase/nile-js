import React from 'react';

import Button from './index';

const meta = {
  title: 'Social/Azure',
  component: Button,
};

export default meta;

export function AzureSSO() {
  return (
    <div className="flex flex-col items-center">
      <Button />
    </div>
  );
}
