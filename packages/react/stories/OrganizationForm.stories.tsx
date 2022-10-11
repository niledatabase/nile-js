import React from 'react';
import { Story } from '@storybook/react';
import { Button } from '@mui/joy';

import OrganizationForm from '../src/components/OrganizationForm';
import { NileProvider } from '../src/context';

const meta = {
  component: OrganizationForm,
  args: {
    org: 'myOrg',
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story = () => (
  <NileProvider basePath="http://localhost:8080">
    <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
      <OrganizationForm
        onSuccess={() => alert('success!')}
        cancelButton={<Button variant="outlined">Cancel</Button>}
      />
    </div>
  </NileProvider>
);

export const Default = Template.bind({});
