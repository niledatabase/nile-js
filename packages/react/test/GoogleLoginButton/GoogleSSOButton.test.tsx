import React from 'react';
import { render, screen } from '@testing-library/react';

import { GoogleSSOButton } from '../../src/GoogleLoginButton';
import { NileProvider } from '../../src/context';

jest.mock('../../src/GoogleLoginButton/google.svg', () => 'svg');

// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

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
