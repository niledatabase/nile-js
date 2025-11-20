import React from 'react';
import { render, screen } from '@testing-library/react';

import OktaSignInButton from './index';

describe('Okta sso button', () => {
  it('renders using the context', () => {
    render(<OktaSignInButton callbackUrl="/" />);
    screen.getByText('Continue with Okta');
  });
});
