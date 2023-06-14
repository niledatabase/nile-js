import React from 'react';
import { Meta } from '@storybook/react';

import { NileProvider } from '../context';

import UserList from '.';

const meta: Meta = {
  tags: ['autodocs'],
  component: UserList,
};

export default meta;

const users = [
  {
    id: 'lqwsd1',
    email: 'test@test.com',
    preferredName: 'test',
    tenants: new Set(['tenant1', 'tenant2', 'tenant3']),
  },
];
export function Basic() {
  return (
    <NileProvider workspace="workspace" database="database" tenantId="tenantId">
      <UserList data={users} />
    </NileProvider>
  );
}
