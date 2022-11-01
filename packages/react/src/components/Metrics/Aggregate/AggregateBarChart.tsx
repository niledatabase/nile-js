import React from 'react';
import { Bar } from 'react-chartjs-2';

import {
  AggregateMetricsRequest,
  AggregationType,
  MetricsBarChartComponentProps,
} from '../types';

import { useAggregation } from './hooks';

type LabelAndData = { x: string; y: number }[];
export default function AggregateLineChart(
  props: {
    aggregation: AggregateMetricsRequest;
  } & MetricsBarChartComponentProps
) {
  const { chartOptions, dataset } = props;

  const aggregationType: AggregationType = props.aggregation.aggregationType;
  const { isLoading, buckets } = useAggregation(props);

  const data = React.useMemo((): LabelAndData => {
    if (!buckets) {
      return [];
    }
    return buckets
      .map((bucket) => {
        return {
          y: Number(bucket[aggregationType]),
          x: bucket.timestamp?.toISOString() as string,
        };
      })
      .filter(Boolean);
  }, [aggregationType, buckets]);

  if (isLoading) {
    return null;
  }

  return (
    <Bar
      options={{
        ...chartOptions,
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
      data={{
        datasets: [
          {
            label: props.aggregation.metricName,
            data,
            backgroundColor: 'rgb(111 226 255)',
            borderColor: 'rgb(77, 158, 178)',
            borderSkipped: true,
            barPercentage: 0.9,
            ...dataset,
          },
        ],
      }}
    />
  );
}
