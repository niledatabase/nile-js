import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Browser from '@niledatabase/browser';

import { NileProvider } from '../../src/context';
import '../matchMedia.mock';
import LoginForm from '../../src/LoginForm/LoginForm';
import { token } from '../fetch.mock';

describe('LoginForm', () => {
  it('calls success if successful', async () => {
    const onSuccess = jest.fn();
    global.fetch = token;
    const api = {
      auth: {
        login: async () => jest.fn(),
      },
    } as unknown as Browser;
    render(
      <NileProvider api={api}>
        <LoginForm onSuccess={onSuccess} />
      </NileProvider>
    );
    const password = screen.getByPlaceholderText('Password');
    fireEvent.change(password, { target: { value: 'supersecret' } });

    const email = screen.getByPlaceholderText('Email');
    fireEvent.change(email, { target: { value: 'squirrel@super.secret' } });

    const button = screen.getByRole('button', { name: 'Log in' });
    fireEvent.click(button);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });
});
