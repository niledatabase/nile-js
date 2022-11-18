import React from 'react';
import { Bar } from 'react-chartjs-2';

import {
  AggregateMetricsRequest,
  AggregationType,
  MetricsBarChartComponentProps,
  UseAggregationProps,
} from '../types';

import { useAggregation, useFormatData, useMinMax } from './hooks';

export default function AggregateBarChart(
  props: {
    aggregation: AggregateMetricsRequest;
  } & MetricsBarChartComponentProps
) {
  const { chartOptions, dataset } = props;
  const aggregationType: AggregationType = props.aggregation.aggregationType;
  const { isLoading, buckets } = useAggregation(
    // removed `startTime`, since it is possible to come from `useMetricsTime()`
    props as unknown as UseAggregationProps
  );
  const data = useFormatData(buckets, aggregationType);
  const minMax = useMinMax();

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
        datasets: [
          {
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
