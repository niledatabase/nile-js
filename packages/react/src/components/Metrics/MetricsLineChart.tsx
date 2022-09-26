import React from 'react';
import { Stack, Typography } from '@mui/joy';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { FilterMetricsRequest } from '@theniledev/js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataset,
  ChartOptions,
} from 'chart.js';

import { useMetrics } from './hooks';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export enum DataKeys {
  timestamp = 'timestamp',
  value = 'value',
  instanceId = 'instanceId',
  attributes = 'attributes',
}

type LabelAndData = {
  labels: string[];
  data: number[];
};

export type MetricsComponentProps = {
  timeFormat?: string;
  dataset?: Omit<ChartDataset<'line', number[]>, 'data'>;
  updateInterval?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartOptions?: ChartOptions<any>;
};

/**
 *
 * @example
 * ```typescript
 * import { MetricsLineChart, NileProvider } from '@theniledev/react';
 * function MyChart() {
 *   const filter = {
 *     entityType: 'clusters',
 *     metricName: 'my.metric',
 *   };
 *
 *   return (
 *     <NileProvider baseUrl="https://prod.thenile.dev" workspace="clustify">
 *       <MetricsLineChart filter={filter} />
 *     </NileProvider>
 *   );
 * }
 * ```
 * @param props configuration for the metrics request and chart.js line
 * @returns  a chart.js line
 */
export default function MetricsLineChart(
  props: FilterMetricsRequest & MetricsComponentProps
): React.ReactElement | null {
  const {
    filter,
    chartOptions,
    timeFormat = 'HH:mm:ss',
    dataset = {
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
  } = props;

  const { isLoading, metrics } = useMetrics(props);
  const metricName = filter.metricName;

  const { labels, data } = React.useMemo<LabelAndData>(() => {
    return metrics.reduce(
      (accum: LabelAndData, metric) => {
        const label: string = format(metric.timestamp, timeFormat);
        accum.labels.push(label);
        accum.data.push(metric.value);
        return accum;
      },
      { labels: [], data: [] }
    );
  }, [metrics, timeFormat]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack>
      <Typography level="h4">{metricName}</Typography>
      <Line
        options={chartOptions}
        data={{
          labels,
          datasets: [
            {
              label: metricName,
              data,
              ...dataset,
            },
          ],
        }}
      />
    </Stack>
  );
}
