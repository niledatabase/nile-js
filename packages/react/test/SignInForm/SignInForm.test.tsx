import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../matchMedia.mock';
import SignInForm from '../../src/SignInForm/SignInForm';
import { token } from '../fetch.mock';

describe('LoginForm', () => {
  it('calls success if successful', async () => {
    const onSuccess = jest.fn();
    global.fetch = token;
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
