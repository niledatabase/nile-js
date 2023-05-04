import React from 'react';
import { Meta, Story } from '@storybook/react';

import { NileProvider } from '../../src/context';
import SignUpForm from '../../src/SignUpForm';

const meta: Meta = {
  component: SignUpForm,
  parameters: {
    controls: { expanded: false },
  },
};

export default meta;

const Template: Story<null> = () => (
  <NileProvider workspace="workspace" database="database">
    <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
      <SignUpForm onSuccess={() => alert('success!')} />
    </div>
  </NileProvider>
);

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});
