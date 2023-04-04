import React from 'react';
import { Story } from '@storybook/react';
import { CssVarsProvider } from '@mui/joy/styles';
import { GoogleSSOButton } from '@theniledev/react/GoogleLoginButton';
import defaultTheme from '@theniledev/react/context/themeJoiner';

const meta = {
  component: GoogleSSOButton,
};

export default meta;

const Template: Story = () => (
  <CssVarsProvider theme={defaultTheme}>
    <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
      <GoogleSSOButton href="some href" />
    </div>
  </CssVarsProvider>
);

export const Default = Template.bind({});
