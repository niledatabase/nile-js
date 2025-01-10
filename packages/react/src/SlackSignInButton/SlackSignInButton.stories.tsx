import React from 'react';

import Button from './index';

const meta = {
  title: 'Social/Slack',
  component: Button,
};

export default meta;

export function SlackSSO() {
  return (
    <div className="flex flex-col items-center">
      <Button />
    </div>
  );
}
