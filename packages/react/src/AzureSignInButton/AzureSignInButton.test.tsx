import React from 'react';
import { render, screen } from '@testing-library/react';

import Button from './index';

describe('Azure sso button', () => {
  it('renders using the context', () => {
    render(<Button callbackUrl="/" />);
    screen.getByText('Continue with Microsoft');
  });
});
