import React from 'react';
import { render, screen } from '@testing-library/react';

import Profile from './index';

describe('Profile info', () => {
  it('renders ', () => {
    render(
      <Profile
        user={{
          id: '123',
          email: 'fake@fake.com',
          created: new Date().toISOString(),
          emailVerified: new Date().toISOString(),
          name: 'SpongeBob',
          familyName: 'SquarePants',
          tenants: [],
        }}
      />
    );
    screen.getByText('SpongeBob SquarePants');
    screen.getByText('fake@fake.com');
  });
});
