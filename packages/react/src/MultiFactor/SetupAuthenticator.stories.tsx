import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { SetupAuthenticator } from './SetupAuthenticator';
import type { AuthenticatorSetup } from './types';

const setup: AuthenticatorSetup = {
  method: 'authenticator',
  token: 'mock-auth-token',
  scope: 'setup',
  otpauthUrl: 'otpauth://totp/Nile:demo?secret=JBSWY3DPEHPK3PXP',
  recoveryKeys: [
    'alpha-bravo-charlie',
    'delta-echo-foxtrot',
    'golf-hotel-india',
    'juliet-kilo-lima',
    'mike-november-oscar',
  ],
};

const meta: Meta<typeof SetupAuthenticator> = {
  title: 'MultiFactor/SetupAuthenticator',
  component: SetupAuthenticator,
  args: {
    setup,
    onError: action('onError'),
    onSuccess: action('onSuccess'),
  },
  render: (args) => <SetupAuthenticator {...args} />,
};

export default meta;

type Story = StoryObj<typeof SetupAuthenticator>;

export const Default: Story = {};
