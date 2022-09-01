// Button.stories.ts|tsx

import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Instance, EntityTypeEnum, OrganizationTypeEnum } from '@theniledev/js';
import { Box, Button, Stack, Typography } from '@mui/joy';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import Card from '@mui/joy/Card';

import InstanceTable from '../src/components/InstanceTable/InstanceTable';
import { NileProvider } from '../src/context';

const entityData = {
  id: 'ent_02qdzM9QKiB7lzR3HZVVEv',
  created: new Date(),
  updated: new Date(),
  type: EntityTypeEnum.Entity,
  name: 'clusters',
  schema: {
    type: 'object',
    required: ['cluster_name'],
    properties: {
      ARN: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
      Endpoint: {
        type: 'string',
      },
      cluster_name: {
        type: 'string',
      },
    },
  },
};
const organization = {
  id: 'org_02qdzMMNHAPIF1XSeD9jrx',
  created: new Date(),
  updated: new Date(),
  type: OrganizationTypeEnum.Organization,
  name: 'Colton Labs',
};
const instances: Instance[] = [
  {
    id: 'inst_02qdzPA1f2F4zQLVj9chm6',
    created: new Date(),
    updated: new Date(),
    seq: 13,
    type: 'clusters',
    properties: {
      status: 'provisioning',
      cluster_name: 'myFirstCluster',
    },
  },
];
const meta: Meta = {
  component: InstanceTable,
  argTypes: {
    isFetching: {
      description:
        'shows the loading state if a network request has been made and no data has been receieved yet',
      control: {
        type: 'boolean',
      },
    },
    renderEmpty: {
      control: {
        type: 'boolean',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

type StoryProps = {
  renderEmpty: boolean;
  renderCustomEmptyState: boolean;
  isFetching: boolean;
  instances: Instance[];
};

const Template: Story<StoryProps> = (args) => {
  return (
    <NileProvider basePath="http://localhost:8080">
      <InstanceTable
        entity="myEntity"
        isFetching={args.isFetching}
        instances={args.renderEmpty ? [] : instances}
        entityData={entityData}
        organization={organization}
        handleRowClick={() => {
          alert('clicked on a row');
        }}
      />
    </NileProvider>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {
  isFetching: false,
  renderEmpty: false,
};

const EmptyState = () => (
  <NileProvider basePath="http://localhost:8080">
    <InstanceTable
      entity="myEntity"
      isFetching={false}
      instances={[]}
      entityData={entityData}
      organization={organization}
      emptyState={({ entity, organization }) => {
        return (
          <Stack sx={{ width: '30rem', margin: '0 auto' }} spacing={2}>
            <Typography level="h3">No {entity} instances found</Typography>
            <Typography level="h6">
              Your organization {organization.name} has not created any
              instances yet. Entities are created by users and managed by
              developers.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" size="lg">
                Learn more
              </Button>
              <Button size="lg">Create {entity}</Button>
            </Stack>
          </Stack>
        );
      }}
    />
  </NileProvider>
);

export const CustomEmptyState = EmptyState.bind({});

const RenderEventLink = (props: GridRenderCellParams<Instance>) => {
  return (
    <Button
      onClick={() => {
        alert(`clicked on ${props.id}`);
      }}
      size="sm"
      variant="outlined"
    >
      view
    </Button>
  );
};

const Columns = () => (
  <NileProvider basePath="http://localhost:8080">
    <InstanceTable
      entity="myEntity"
      isFetching={false}
      instances={instances}
      entityData={entityData}
      organization={organization}
      columns={['status', 'cluster_name']}
      additionalColumns={[
        {
          field: 'action button',
          headerName: 'table button',
          flex: 1,
          minWidth: 100,
          renderCell: RenderEventLink,
        },
      ]}
    />
  </NileProvider>
);

export const FilteredAndCustomColumns = Columns.bind({});

const ActionButtons = () => (
  <NileProvider basePath="http://localhost:8080">
    <InstanceTable
      entity="myEntity"
      isFetching={false}
      instances={instances}
      entityData={entityData}
      organization={organization}
      actionButtons={[
        <Button variant="solid" startIcon={<Add />} size="sm" key="addEntity">
          Create myEntity
        </Button>,
      ]}
    />
  </NileProvider>
);

export const TableActionButtons = ActionButtons.bind({});

const Cards = () => (
  <NileProvider basePath="http://localhost:8080">
    <InstanceTable
      entity="myEntity"
      isFetching={false}
      instances={instances.concat([
        {
          id: 'inst_02das43sfDsFDD',
          created: new Date(),
          updated: new Date(),
          seq: 13,
          type: 'clusters',
          properties: {},
        },
      ])}
      entityData={entityData}
      organization={organization}
      showExpandedView={true}
      expandedView={({ instances }: { instances: Instance[] }) => {
        return (
          <Box
            component="ul"
            sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', p: 0, m: 0 }}
          >
            {instances.map((instance) => {
              return (
                <Card key={instance.id} variant="outlined">
                  <Typography component="strong">Instance</Typography>
                  <Typography level="body2">{instance.id}</Typography>
                  <Typography component="pre" level="body3">
                    {JSON.stringify(instance, null, 2)}
                  </Typography>
                </Card>
              );
            })}
          </Box>
        );
      }}
    />
  </NileProvider>
);

export const NonStructuredData = Cards.bind({});
