import React from 'react';
import { render, screen } from '@testing-library/react';

import GoogleSSOButton from '../../src/GoogleLoginButton/GoogleSSOButton';
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
      <NileProvider workspace="workspace" database="database">
        <GoogleSSOButton />
      </NileProvider>
    );
    screen.getByText('Continue with Google');
    expect(screen.getByRole('link').getAttribute('href')).toEqual(
      'https://prod.thenile.dev/workspaces/workspace/databases/database/users/oidc/google/login'
    );
  });
});
