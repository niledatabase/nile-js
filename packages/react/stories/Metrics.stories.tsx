import React from 'react';
import { Story } from '@storybook/react';
import {
  Box,
  Button,
  FormLabel,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy';
import { Metric, MetricTypeEnum } from '@theniledev/js';
import { Controller, useForm, Control } from 'react-hook-form';

import { MetricsLineChart } from '../src/components/Metrics';
import { NileProvider, useNile } from '../src/context';
import Queries, { useMutation, useQuery } from '../src/lib/queries';

const mData = [
  {
    name: 'my.metric',
    type: MetricTypeEnum.Gauge,
    entityType: 'clusters',
    measurements: [
      {
        timestamp: new Date('2022-09-14T17:22:50.888385+01:00'),
        value: 0.265110677612526,
        instanceId: 'inst_02qy6pIEXT0f1ZUAYoVSZ1',
        attributes: {},
      },
      {
        timestamp: new Date('2022-09-14T17:24:00.888385+01:00'),
        value: 0.285110677612526,
        instanceId: 'inst_02qy6pIEXT0f1ZUAYoVSZ1',
        attributes: {},
      },
      {
        timestamp: new Date('2022-09-14T17:24:10.888385+01:00'),
        value: 0.225110677612526,
        instanceId: 'inst_02qy6pIEXT0f1ZUAYoVSZ1',
        attributes: {},
      },
      {
        timestamp: new Date('2022-09-14T17:24:20.888385+01:00'),
        value: 0.295110677612526,
        instanceId: 'inst_02qy6pIEXT0f1ZUAYoVSZ1',
        attributes: {},
      },
      {
        timestamp: new Date('2022-09-14T17:24:30.888385+01:00'),
        value: 0.385110677612526,
        instanceId: 'inst_02qy6pIEXT0f1ZUAYoVSZ1',
        attributes: {},
      },
    ],
  },
];

const meta = {
  component: MetricsControl,
  args: {
    basePath: 'http://localhost:8080',
    metricData: mData,
  },
  argTypes: {
    authToken: {
      description: 'A nile auth token',
      type: { name: 'string', required: true },
      control: {
        type: 'text',
      },
    },
    basePath: {
      description: 'The FQDN of the nile instance',
      type: { name: 'string', required: true },
      control: {
        type: 'text',
      },
    },
    workspace: {
      description: 'Name of your workspace containing entities',
      type: { name: 'string', required: true },
      control: {
        type: 'text',
      },
    },
    metricName: {
      description:
        'The name used to create the metric. It should match a `name` key inside the metricData array.',
      type: { name: 'string', required: true },
      control: {
        type: 'text',
      },
    },
    metricData: {
      description: 'Metric data to send to the API',
      control: { type: 'array', required: true },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const useEntityDropdown = ({
  control,
}: {
  control: Control<{ entityType: string; authToken: string }>;
}) => {
  const nile = useNile();
  const { data = [] } = useQuery(
    [Queries.ListEntities],
    () => nile.entities.listEntities(),
    { enabled: Boolean(nile.workspace && nile.authToken) }
  );
  const entities = React.useMemo(() => {
    return data.map((entity) => entity.name);
  }, [data]);

  return (
    <Stack>
      <FormLabel>Entity type</FormLabel>
      <Controller
        control={control}
        name="entityType"
        render={({ field }) => {
          return (
            <Select {...field}>
              {entities.map((name) => {
                return (
                  <Option key={name} value={name}>
                    {name}
                  </Option>
                );
              })}
            </Select>
          );
        }}
      />
    </Stack>
  );
};

function MetricsControl({
  metricName,
  authToken,
  metricData,
}: {
  metricData: Metric[];
  metricName: string;
  authToken: string;
}) {
  const nile = useNile();
  const { watch, control } = useForm({
    defaultValues: {
      entityType: '',
      authToken: '',
    },
  });

  const entityType = watch('entityType');
  nile.authToken = authToken;

  const mutation = useMutation(['add metrics'], () =>
    nile.metrics.produceBatchOfMetrics({
      metric: metricData,
    })
  );
  const EntityDropdown = useEntityDropdown({ control });

  if (!nile.workspace) {
    return (
      <Typography>
        Please enter your workspace and metric name in the Controls tab.
      </Typography>
    );
  }

  if (!nile.authToken) {
    return <Typography>Enter an authToken in the Controls tab.</Typography>;
  }

  return (
    <Stack spacing={2}>
      <Stack spacing={2}>{nile.authToken && EntityDropdown}</Stack>
      {nile.authToken && (
        <>
          <Box>
            <Button
              onClick={(): void => {
                mutation.mutate();
              }}
            >
              Add metrics
            </Button>
          </Box>
          {entityType && (
            <MetricsLineChart filter={{ entityType, metricName }} />
          )}
        </>
      )}
    </Stack>
  );
}

type PropTypes = {
  workspace: string;
  metricName: string;
  basePath: string;
  authToken: string;
  metricData: Metric[];
};

const LineChart: Story<null> = (props) => {
  const { metricData, basePath, workspace, metricName, authToken }: PropTypes =
    props as unknown as PropTypes;
  return (
    <NileProvider basePath={basePath} workspace={workspace}>
      <div style={{ maxWidth: '20rem', margin: '0 auto' }}>
        <MetricsControl
          metricName={metricName}
          authToken={authToken}
          metricData={metricData}
        />
      </div>
    </NileProvider>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = LineChart.bind({});
