import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { ChallengeContent } from './ChallengeContent';
import type { MfaSetup } from './types';

const baseSetup: MfaSetup = {
  method: 'authenticator',
  token: 'mock-token',
  scope: 'challenge',
};

const meta: Meta<typeof ChallengeContent> = {
  title: 'MultiFactor/ChallengeContent',
  component: ChallengeContent,
  args: {
    payload: baseSetup,
    message: 'Enter the 6-digit code from your authenticator app to continue.',
    isEnrolled: true,
    onSuccess: action('onSuccess'),
  },
};

export default meta;

type Story = StoryObj<typeof ChallengeContent>;

export const AuthenticatorChallenge: Story = {};

export const EmailChallenge: Story = {
  args: {
    payload: {
      method: 'email',
      token: 'mock-email-token',
      scope: 'challenge',
      maskedEmail: 'j***@example.com',
    },
    message: 'Enter the 6-digit code we emailed you.',
    isEnrolled: true,
  },
};
