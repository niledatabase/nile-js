import React from 'react';
import { render, screen } from '@testing-library/react';

import Profile from './index';

describe('Profile info', () => {
  it('renders ', () => {
    render(
      <Profile
        user={{
          email: 'fake@fake.com',
          created: new Date(),
          emailVerified: new Date(),
          name: 'SpongeBob',
          familyName: 'SquarePants',
        }}
      />
    );
    screen.getByText('SpongeBob SquarePants');
    screen.getByText('fake@fake.com');
  });
});
