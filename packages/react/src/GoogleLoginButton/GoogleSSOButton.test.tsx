import React from 'react';
import { render, screen } from '@testing-library/react';

import GoogleSSOButton from './GoogleLoginButton';

describe('google sso button', () => {
  it('renders using the context', () => {
    render(<GoogleSSOButton callbackUrl="/" />);
    screen.getByText('Continue with Google');
  });
});
