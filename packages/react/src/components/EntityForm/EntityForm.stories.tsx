import React from 'react';
import { Story } from '@storybook/react';
import { Button } from '@mui/joy';

import { AttributeType } from '../../lib/SimpleForm/types';
import { NileProvider } from '../../context';

import EntityForm from './EntityForm';

const meta = {
  tags: ['autodocs'],
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
    type: AttributeType.Checkbox,
    required: true,
    allowMultiple: true,
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
    defaultValue: 'test',
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
  <NileProvider basePath="http://localhost:8080" workspace="my_workspace">
    <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
      <EntityForm
        entityType={entityType}
        onSuccess={() => alert('success!')}
        fields={customFieldAttributes}
        org={org}
        cancelButton={<Button variant="outlined">Cancel</Button>}
      />
    </div>
  </NileProvider>
);

const enumAttributes = [
  {
    name: 'boolean',
    label: 'Single boolean',
    type: AttributeType.Checkbox,
    options: [{ label: 'Amazon', value: 'aws' }],
  },
  {
    name: 'single',
    label: 'Pick single enum',
    type: AttributeType.Checkbox,
    options: [
      { label: 'Test', value: 'test' },
      { label: 'Development', value: 'dev' },
      { label: 'Production', value: 'prod' },
    ],
  },
  {
    name: 'multi',
    label: 'Pick multiple enum',
    type: AttributeType.Checkbox,
    allowMultiple: true,
    options: [
      { label: 'Amazon', value: 'aws' },
      { label: 'Google', value: 'gcp' },
      { label: 'Microsoft', value: 'azure' },
    ],
  },
];
export const Enum: Story<StoryArgs> = ({ org, entityType }: StoryArgs) => (
  <NileProvider basePath="http://localhost:8080" workspace="my_workspace">
    <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
      <EntityForm
        entityType={entityType}
        onSuccess={() => alert('success!')}
        fields={enumAttributes}
        org={org}
        cancelButton={<Button variant="outlined">Cancel</Button>}
      />
    </div>
  </NileProvider>
);

export const Default = Template.bind({});
