// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React from 'react';
import { AggregationRequestBucketSizeEnum } from '@theniledev/js';
import { Story } from '@storybook/react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

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

const Empty: Story<null> = () => {
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
      <MetricsBarChart
        aggregation={aggregation}
        emptyState={
          <Stack sx={{ width: '560px' }}>
            {/* eslint-disable-next-line react/no-unknown-property*/}
            <marquee behavior="alternate" scrollamount="20">
              <Typography level="h1">NO METRICS</Typography>
            </marquee>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=true"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </Stack>
        }
      />
    </NileProvider>
  );
};

export const CustomizedEmptyChart = Empty.bind({});

CustomizedEmptyChart.parameters = {
  mockData: [
    {
      url: 'http://localhost:8080/workspaces/workspace/metrics/my.metric/aggregate',
      method: 'POST',
      status: 200,
      response: [],
    },
  ],
};
