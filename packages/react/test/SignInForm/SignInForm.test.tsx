import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../matchMedia.mock';
import SignInForm from '../../src/SignInForm/SignInForm';

const mockFetchResponse = (data: unknown, options: Partial<Response> = {}) => ({
  ok: true,
  status: 200,
  ...options,
  json: async () => data,
  clone: () => mockFetchResponse(data, options), // support clone()
});

describe('LoginForm', () => {
  it('calls success if successful', async () => {
    const onSuccess = jest.fn();
    global.fetch = jest.fn().mockResolvedValueOnce(
      mockFetchResponse({
        credentials: { id: 'providers', type: 'providers' },
      })
    );
    render(<SignInForm onSuccess={onSuccess} />);
    const password = screen.getByPlaceholderText('Password');
    fireEvent.change(password, { target: { value: 'supersecret' } });

    const email = screen.getByPlaceholderText('Email');
    fireEvent.change(email, { target: { value: 'squirrel@super.secret' } });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(submitButton);
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });
});
