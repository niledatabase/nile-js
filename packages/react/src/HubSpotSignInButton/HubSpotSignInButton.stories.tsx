import React from 'react';

import Button from './index';

const meta = {
  title: 'Social/HubSpot',
  component: Button,
};

export default meta;

export function HubSpotSSO() {
  return (
    <div className="flex flex-col items-center">
      <Button />
    </div>
  );
}
