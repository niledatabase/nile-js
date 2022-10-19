import React from 'react';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

import { useAggregation } from './hooks';
import { AggregateMetricsRequest, MetricsComponentProps } from './types';

export default function AggregateLineChart(
  props: { aggregation: AggregateMetricsRequest } & MetricsComponentProps
) {
  type LabelAndData = {
    labels: string[];
    data: number[];
  };
  const { chartOptions, timeFormat = 'HH:mm:ss', dataset } = props;

  const aggregationType = props.aggregation.aggregationType;
  const { isLoading, buckets } = useAggregation(props);

  const { labels, data } = React.useMemo<LabelAndData>(() => {
    if (!buckets) {
      return { labels: [], data: [] };
    }

    return buckets.reduce(
      (accum: LabelAndData, bucket) => {
        if (bucket.timestamp && bucket[aggregationType]) {
          const label: string = format(new Date(bucket.timestamp), timeFormat);
          accum.labels.push(label);
          accum.data.push(Number(bucket[aggregationType]));
        }
        return accum;
      },
      { labels: [], data: [] }
    );
  }, [aggregationType, buckets, timeFormat]);

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
            label: props.aggregation.metricName,
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
