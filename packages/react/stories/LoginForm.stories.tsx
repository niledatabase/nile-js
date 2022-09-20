import React from 'react';
import { Meta, Story } from '@storybook/react';

import LoginForm from '../src/components/LoginForm';
import { NileProvider } from '../src/context';

const meta: Meta = {
  component: LoginForm,
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<null> = () => (
  <NileProvider basePath="http://localhost:8080">
    <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
      <LoginForm onSuccess={() => alert('success!')} />
    </div>
  </NileProvider>
);

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});
