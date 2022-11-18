import React from 'react';
import { Bar } from 'react-chartjs-2';
import { FilterMetricsRequest } from '@theniledev/js';
import {
  Chart,
  CategoryScale,
  BarController,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartDataset,
  ChartOptions,
  BarElement,
} from 'chart.js';

import { useFilter, useFormatData, useMinMax } from './hooks';

Chart.register(
  CategoryScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export type MetricsComponentProps = {
  timeFormat?: string;
  dataset?: Omit<ChartDataset<'bar', number[]>, 'data'>;
  updateInterval?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartOptions?: ChartOptions<any>;
  queryKey?: string;
};

export default function FilterBarChart(
  props: FilterMetricsRequest & MetricsComponentProps
) {
  const { filter, chartOptions, dataset } = props;
  const { isLoading, metrics } = useFilter(props);
  const metricName = filter.metricName;
  const data = useFormatData(metrics);
  const minMax = useMinMax(filter);

  const sets = React.useMemo(() => {
    return data.map((datum) => {
      return {
        label: metricName,
        data: [datum],
        backgroundColor: 'rgb(111 226 255)',
        borderColor: 'rgb(77, 158, 178)',
        borderSkipped: true,
        barPercentage: 0.9,
        grouped: true,
        ...dataset,
      };
    });
  }, [data, dataset, metricName]);

  if (isLoading) {
    return null;
  }

  return (
    <Bar
      options={{
        ...chartOptions,
        scales: {
          x: {
            ...minMax,
            type: 'time',
            stacked: true,
            ...chartOptions?.scales?.x,
          },
          y: {
            beginAtZero: true,
            ...chartOptions?.scales?.y,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
      data={{
        datasets: sets,
      }}
    />
  );
}
