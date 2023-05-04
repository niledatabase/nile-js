import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NileProvider } from '@theniledev/react';
import Cookies from 'js-cookie';
import '../matchMedia.mock';

import LoginForm from '../../src/LoginForm/LoginForm';
import { token } from '../fetch.mock';

describe('LoginForm', () => {
  it('sets a js cookie by default', async () => {
    const spy = jest.spyOn(Cookies, 'set');
    const onSuccess = jest.fn();
    global.fetch = token;
    render(
      <NileProvider workspace="workspace" database="database">
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
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
