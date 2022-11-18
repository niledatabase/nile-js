import React from 'react';
import { Story } from '@storybook/react';
import { AggregationRequestBucketSizeEnum } from '@theniledev/js';

import { MetricsLineChart, StartTime } from '../../src/components/Metrics';
import { NileProvider } from '../../src/context';
import { AggregationType } from '../../src/components/Metrics/types';

import { makeAggregate, makeFilter } from './metricsMaker';

const meta = {
  component: MetricsLineChart,
};

export default meta;

const filter = makeFilter();
const aggregate = makeAggregate();

const LineChart: Story<null> = () => {
  const filter = {
    entityType: 'clusters',
    metricName: 'my.metric',
  };
  return (
    <NileProvider basePath="http://localhost:8080" workspace="workspace">
      <StartTime />
      <MetricsLineChart filter={filter} />
    </NileProvider>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const FilterLineChart = LineChart.bind({});

FilterLineChart.parameters = {
  mockData: [
    {
      url: 'http://localhost:8080/workspaces/workspace/metrics/filter',
      method: 'POST',
      status: 200,
      response: filter,
    },
  ],
};

const AggLineChart: Story<null> = () => {
  const aggregation = {
    aggregationType: AggregationType.Sum,
    aggregationRequest: {
      organizationId: 'myOrganization',
      bucketSize: AggregationRequestBucketSizeEnum._10m,
    },
    metricName: 'my.metric',
  };
  return (
    <NileProvider basePath="http://localhost:8080" workspace="workspace">
      <StartTime />
      <MetricsLineChart
        aggregation={aggregation}
        dataset={{ pointRadius: 10 }}
      />
    </NileProvider>
  );
};

export const AggregateLineChart = AggLineChart.bind({});

AggregateLineChart.parameters = {
  mockData: [
    {
      url: 'http://localhost:8080/workspaces/workspace/metrics/my.metric/aggregate',
      method: 'POST',
      status: 200,
      response: aggregate,
    },
  ],
};
