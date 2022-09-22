import React from 'react';
import { Story } from '@storybook/react';

import EntityForm from '../src/components/EntityForm';
import { AttributeType } from '../src/lib/SimpleForm';
import { NileProvider } from '../src/context';

const meta = {
  component: EntityForm,
  args: {
    org: 'myOrg',
    entityType: 'SaasDB',
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const customFieldAttributes = [
  { name: 'dbName', label: 'Database name', required: true },
  {
    name: 'cloud',
    label: 'Cloud provider',
    type: AttributeType.Select,
    required: true,
    options: [
      { label: 'Amazon', value: 'aws' },
      { label: 'Google', value: 'gcp' },
      { label: 'Microsoft', value: 'azure' },
    ],
  },
  {
    name: 'environment',
    label: 'Environment',
    type: AttributeType.Select,
    options: [
      { label: 'Test', value: 'test' },
      { label: 'Development', value: 'dev' },
      { label: 'Production', value: 'prod' },
    ],
  },
  { name: 'size', label: 'Size', type: AttributeType.Number },
];

type StoryArgs = {
  org: string;
  entityType: string;
};

const Template: Story<StoryArgs> = ({ org, entityType }: StoryArgs) => (
  <NileProvider basePath="http://localhost:8080">
    <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
      <EntityForm
        entityType={entityType}
        onSuccess={() => alert('success!')}
        fields={customFieldAttributes}
        org={org}
        cancelLink="#linkToSomewhere"
      />
    </div>
  </NileProvider>
);

export const Default = Template.bind({});
