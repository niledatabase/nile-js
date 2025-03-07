import React from 'react';

import Button from './index';

const meta = {
  title: 'Social/Discord',
  component: Button,
};

export default meta;

export function DiscordSSO() {
  return (
    <div className="flex flex-col items-center">
      <Button />
    </div>
  );
}
