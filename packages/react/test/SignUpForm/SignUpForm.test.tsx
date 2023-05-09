import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NileProvider } from '@theniledev/react';
import '../matchMedia.mock';

import SignUpForm from '../../src/SignUpForm/SignUpForm';
import { token } from '../fetch.mock';

describe('SignUpForm', () => {
  it('calls success if successful', async () => {
    const onSuccess = jest.fn();
    global.fetch = token;
    render(
      <NileProvider workspace="workspace" database="database">
        <SignUpForm onSuccess={onSuccess} />
      </NileProvider>
    );
    const password = screen.getByPlaceholderText('Password');
    fireEvent.change(password, { target: { value: 'supersecret' } });

    const email = screen.getByPlaceholderText('Email');
    fireEvent.change(email, { target: { value: 'squirrel@super.secret' } });

    const button = screen.getByRole('button', { name: 'Sign up' });
    fireEvent.click(button);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });
});
