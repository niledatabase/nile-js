import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Client } from '@theniledev/browser';

import '../matchMedia.mock';
import { NileProvider } from '../../src/context';
import Okta from '../../src/SSO/Okta';
import { token } from '../fetch.mock';

describe('Okta', () => {
  it('calls success if successful', async () => {
    const onSuccess = jest.fn();
    global.fetch = token;
    const api = {
      auth: {
        createProvider: async () => jest.fn(),
      },
    } as unknown as Client;
    render(
      <NileProvider api={api}>
        <Okta onSuccess={onSuccess} />
      </NileProvider>
    );
    const clientId = screen.getByLabelText('Client id');
    fireEvent.change(clientId, { target: { value: 'clientId' } });

    const clientSecret = screen.getByLabelText('Client secret');
    fireEvent.change(clientSecret, { target: { value: 'clientSecret' } });

    const configUrl = screen.getByLabelText('Config url');
    fireEvent.change(configUrl, { target: { value: 'configUrl' } });

    const redirectURI = screen.getByLabelText('Redirect URI');
    fireEvent.change(redirectURI, { target: { value: 'redirectURI' } });

    const emailDomains = screen.getByLabelText('Email domains');
    fireEvent.change(emailDomains, { target: { value: 'emailDomains' } });

    const button = screen.getByRole('button', { name: 'Update' });
    fireEvent.click(button);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });
});
