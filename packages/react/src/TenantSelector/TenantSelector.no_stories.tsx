import React from 'react';
import { Meta } from '@storybook/react';

import TenantSelector from '.';

const meta: Meta = {
  title: 'Tenant selector',
  component: TenantSelector,
};

export default meta;

/*
This looks really bad in storybook for some reason
*/
export function SelectTenant() {
  const tenants = [
    { id: '1', name: 'Tenant 1' },
    { id: '2', name: 'Tenant 2' },
  ];
  return (
    <div style={{ width: 500 }} className="mx-auto">
      <TenantSelector activeTenant={tenants[0].name} tenants={tenants} />
    </div>
  );
}
