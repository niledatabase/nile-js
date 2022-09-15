import React from 'react';
import { Stack, Typography } from '@mui/joy';
import { XAxis, YAxis, LineChart, Line, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { LineProps } from 'recharts';
import { FilterMetricsRequest } from '@theniledev/js';

import { useMetrics } from './hooks';

export enum DataKeys {
  timestamp = 'timestamp',
  value = 'value',
  instanceId = 'instanceId',
  attributes = 'attributes',
}

export type MetricsComponentProps = {
  height?: number;
  width?: number;
  timeFormat?: 'string';
  line?: LineProps;
};

export default function MetricsLineChart(
  props: FilterMetricsRequest & MetricsComponentProps
): React.ReactElement | null {
  const {
    filter,
    width = 500,
    height = 300,
    timeFormat = 'HH:ss',
    line = { type: 'monotone', stroke: '#82ca9d' },
  } = props;
  const { isLoading, metrics } = useMetrics(props);
  const metricName = filter.metricName;

  if (isLoading) {
    return null;
  }

  return (
    <Stack>
      <Typography level="h4">{metricName}</Typography>
      <LineChart data={metrics} width={width} height={height}>
        <Legend />
        <Tooltip />
        <XAxis
          dataKey={DataKeys.timestamp}
          tickFormatter={(time: string | Date): string => {
            if (time instanceof Date) {
              return format(time, timeFormat);
            }
            return time;
          }}
        />
        <YAxis />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
        <Line dataKey={DataKeys.value} {...(line as any)} />
      </LineChart>
    </Stack>
  );
}
