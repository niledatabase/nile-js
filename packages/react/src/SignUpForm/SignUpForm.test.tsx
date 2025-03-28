import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { useSignUp } from './hooks';
import SigningIn from './Form';

// Mock dependencies
jest.mock('./hooks', () => ({
  useSignUp: jest.fn(),
}));

describe('SigningIn', () => {
  it('submits email and password to signIn', async () => {
    const signUpMock = jest.fn();
    (useSignUp as jest.Mock).mockReturnValue(signUpMock);

    render(<SigningIn />);

    fireEvent.change(screen.getByLabelText('email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalled();
    });
  });
});
