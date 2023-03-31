import React from 'react';
import { Story } from '@storybook/react';
import { CssVarsProvider } from '@mui/joy/styles';

import { Button } from '../../src/GoogleLoginButton';
import defaultTheme from '../../src/context/themeJoiner';

const meta = {
  component: Button,
};

export default meta;

const Template: Story = () => (
  <CssVarsProvider theme={defaultTheme}>
    <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
      <Button href="some href" />
    </div>
  </CssVarsProvider>
);

export const Default = Template.bind({});
