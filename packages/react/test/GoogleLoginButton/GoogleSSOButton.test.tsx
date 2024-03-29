import React from 'react';
import { render, screen } from '@testing-library/react';

import GoogleSSOButton from '../../src/GoogleLoginButton/GoogleLoginButton';
import { NileProvider } from '../../src/context';
import '../matchMedia.mock';

jest.mock('../../src/GoogleLoginButton/google.svg', () => 'svg');

describe('google sso button', () => {
  it('renders with an href prop', () => {
    const ref = 'somehref';
    render(<GoogleSSOButton href={ref} />);
    expect(screen.getByRole('link').getAttribute('href')).toEqual(ref);
  });
  it('renders using the context', () => {
    render(
      <NileProvider>
        <GoogleSSOButton workspace="workspace" database="database" />
      </NileProvider>
    );
    screen.getByText('Continue with Google');
    expect(screen.getByRole('link').getAttribute('href')).toEqual(
      'https://api.thenile.dev/workspaces/workspace/databases/database/users/oidc/google/login'
    );
  });
});
