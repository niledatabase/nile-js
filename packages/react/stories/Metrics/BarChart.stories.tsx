import React from 'react';
import { Story } from '@storybook/react';
import { AggregationRequestBucketSizeEnum } from '@theniledev/js';

import { MetricsBarChart } from '../../src/components/Metrics';
import { NileProvider } from '../../src/context';
import { AggregationType } from '../../src/components/Metrics/types';

import filter from './filter.json';
import aggregate from './aggregate.json';

const meta = {
  component: MetricsBarChart,
  parameters: {
    controls: { expanded: false },
  },
};

export default meta;

const LineChart: Story<null> = () => {
  const filter = {
    entityType: 'clusters',
    metricName: 'my.metric',
  };
  return (
    <NileProvider basePath="http://localhost:8080" workspace="workspace">
      <MetricsBarChart filter={filter} />
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

const AggBarChart: Story<null> = () => {
  const aggregation = {
    aggregationType: AggregationType.Sum,
    aggregationRequest: {
      startTime: new Date('2022-11-02T13:50:00Z'),
      organizationId: 'myOrganization',
      bucketSize: AggregationRequestBucketSizeEnum._10m,
    },
    metricName: 'my.metric',
  };
  return (
    <NileProvider basePath="http://localhost:8080" workspace="workspace">
      <MetricsBarChart aggregation={aggregation} />
    </NileProvider>
  );
};

export const AggregateBarChart = AggBarChart.bind({});

AggregateBarChart.parameters = {
  mockData: [
    {
      url: 'http://localhost:8080/workspaces/workspace/metrics/my.metric/aggregate',
      method: 'POST',
      status: 200,
      response: aggregate,
    },
  ],
};

const StackedBarChart: Story<null> = () => {
  const filter = {
    entityType: 'clusters',
    metricName: 'my.metric',
  };
  return (
    <NileProvider basePath="http://localhost:8080" workspace="workspace">
      <MetricsBarChart
        filter={filter}
        chartOptions={{
          tooltips: {
            enabled: false,
          },
          scales: {
            x: {
              // The axis for this scale is determined from the first letter of the id as `'x'`
              // It is recommended to specify `position` and / or `axis` explicitly.
              type: 'time',
              stacked: true,
            },
            y: {
              beginAtZero: true,
              stacked: true,
              ticks: {
                callback: function (value: number) {
                  if (value % 1 === 0) {
                    return value;
                  }
                },
              },
            },
          },
        }}
      />
    </NileProvider>
  );
};

export const StackedFilterBarChart = StackedBarChart.bind({});

StackedFilterBarChart.parameters = {
  mockData: [
    {
      url: 'http://localhost:8080/workspaces/workspace/metrics/filter',
      method: 'POST',
      status: 200,
      response: filter,
    },
  ],
};
