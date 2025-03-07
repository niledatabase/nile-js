import React from 'react';

import Button from './index';

const meta = {
  title: 'Social/GitHub',
  component: Button,
};

export default meta;

export function GitHubSSO() {
  return (
    <div className="flex flex-col items-center">
      <Button />
    </div>
  );
}
