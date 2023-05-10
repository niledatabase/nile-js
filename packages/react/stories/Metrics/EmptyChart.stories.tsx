import React from 'react';
import { AggregationRequestBucketSizeEnum } from '@theniledev/js';

import { MetricsBarChart } from '../../src/components/Metrics';
import { AggregationType } from '../../src/components/Metrics/types';
import { NileProvider } from '../../src/context';

const meta = {
  component: MetricsBarChart,
  parameters: {
    controls: { expanded: false },
  },
};

export default meta;

const Empty = () => {
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
      <MetricsBarChart aggregation={aggregation} />
    </NileProvider>
  );
};

export const EmptyChart = Empty.bind({});

EmptyChart.parameters = {
  mockData: [
    {
      url: 'http://localhost:8080/workspaces/workspace/metrics/my.metric/aggregate',
      method: 'POST',
      status: 200,
      response: [],
    },
  ],
};
