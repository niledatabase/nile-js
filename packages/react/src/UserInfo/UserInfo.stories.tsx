import React from 'react';
import { Meta } from '@storybook/react';

import UserInfo from '.';

const meta: Meta = {
  title: 'User information',
  component: UserInfo,
};

export default meta;

export function UserProfile() {
  return (
    <div style={{ width: 500 }} className="mx-auto">
      <UserInfo
        user={{
          email: 'fake@fake.com',
          created: new Date(),
          emailVerified: new Date(),
          name: 'SpongeBob',
          familyName: 'SquarePants',
        }}
      />
    </div>
  );
}
