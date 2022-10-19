import React from 'react';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { FilterMetricsRequest } from '@theniledev/js';

import { useFilter } from './hooks';
import { MetricsComponentProps } from './types';

type LabelAndData = {
  labels: string[];
  data: number[];
};

export default function FilterLineChart(
  props: FilterMetricsRequest & MetricsComponentProps
) {
  const { filter, chartOptions, timeFormat = 'HH:mm:ss', dataset } = props;

  const { isLoading, metrics } = useFilter(props);
  const metricName = filter.metricName;

  const { labels, data } = React.useMemo<LabelAndData>(() => {
    if (!metrics) {
      return { labels: [], data: [] };
    }

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
    <Line
      options={{
        ...chartOptions,
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
      data={{
        labels,
        datasets: [
          {
            label: metricName,
            data,
            borderColor: 'rgb(111 226 255)',
            backgroundColor: 'rgb(77, 158, 178)',
            pointRadius: 0,
            borderWidth: 6,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            ...dataset,
          },
        ],
      }}
    />
  );
}
