import React from 'react';
import { render, screen } from '@testing-library/react';

import GoogleSSOButton from '../../src/GoogleLoginButton/GoogleLoginButton';
import { NileProvider } from '../../src/context';
import '../matchMedia.mock';

jest.mock('../../src/GoogleLoginButton/google.svg', () => 'svg');

describe('google sso button', () => {
  it('renders using the context', () => {
    render(
      <NileProvider apiUrl="https://api.thenile.dev/databases/databaseId">
        <GoogleSSOButton />
      </NileProvider>
    );
    screen.getByText('Continue with Google');
    expect(screen.getByRole('link').getAttribute('href')).toEqual(
      'https://api.thenile.dev/databases/databaseId/users/oidc/google/login'
    );
  });
});
