import React from 'react';
import { Story } from '@storybook/react';
import { Button } from '@mui/joy';

import { NileProvider } from '../../context';

import OrganizationForm from '.';

const meta = {
  component: OrganizationForm,
  args: {
    org: 'myOrg',
  },
  tags: ['autodocs'],
};

export default meta;

const Template: Story = () => (
  <NileProvider basePath="http://localhost:8080" workspace="workspace">
    <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
      <OrganizationForm
        onSuccess={() => alert('success!')}
        cancelButton={<Button variant="outlined">Cancel</Button>}
      />
    </div>
  </NileProvider>
);

export const Default = Template.bind({});
