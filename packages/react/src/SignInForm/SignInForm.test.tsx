import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { useSignIn } from './hooks';
import SigningIn from './Form';

// Mock dependencies
jest.mock('./hooks', () => ({
  useSignIn: jest.fn(),
}));

describe('SigningIn', () => {
  it('submits email and password to signIn', async () => {
    const signInMock = jest.fn();
    (useSignIn as jest.Mock).mockReturnValue(signInMock);

    render(<SigningIn />);

    fireEvent.change(screen.getByLabelText('email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalled();
    });
  });
});
