import React from 'react';
import { Meta } from '@storybook/react';

import TenantSelector from '.';

const meta: Meta = {
  title: 'Tenant selector',
  component: TenantSelector,
};

export default meta;

export function SelectTenant() {
  document.cookie = 'nile.tenant_id=1';
  const tenants = [
    { id: '1', name: 'Tenant 1' },
    { id: '2', name: 'Tenant 2' },
  ];
  return (
    <div style={{ width: 500 }} className="mx-auto">
      <TenantSelector activeTenant={tenants[0].id} tenants={tenants} />
    </div>
  );
}
export function EmptyState() {
  document.cookie = 'nile.tenant_id=';
  const tenants = [
    { id: '1', name: 'Tenant 1' },
    { id: '2', name: 'Tenant 2' },
  ];
  return (
    <div style={{ width: 500 }} className="mx-auto">
      <TenantSelector activeTenant={tenants[0].id} tenants={tenants} />
    </div>
  );
}
