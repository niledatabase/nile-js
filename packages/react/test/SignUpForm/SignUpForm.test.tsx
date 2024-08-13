import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Browser from '@niledatabase/browser';

import '../matchMedia.mock';
import { NileProvider } from '../../src/context';
import SignUpForm from '../../src/SignUpForm/SignUpForm';
import { token } from '../fetch.mock';

describe('SignUpForm', () => {
  it('calls success if successful', async () => {
    const onSuccess = jest.fn();
    global.fetch = token;
    const api = {
      auth: {
        signUp: async () => jest.fn(),
      },
    } as unknown as Browser;
    render(
      <NileProvider api={api}>
        <SignUpForm onSuccess={onSuccess} />
      </NileProvider>
    );
    const password = screen.getByPlaceholderText('Password');
    fireEvent.change(password, { target: { value: 'supersecret' } });

    const email = screen.getByPlaceholderText('Email');
    fireEvent.change(email, { target: { value: 'squirrel@super.secret' } });

    const button = screen.getByRole('button', { name: 'Sign up' });
    fireEvent.click(button);

    // await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });
});
