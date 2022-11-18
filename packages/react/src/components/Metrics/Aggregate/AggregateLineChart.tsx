import React from 'react';
import { Line } from 'react-chartjs-2';

import {
  AggregateMetricsRequest,
  MetricsLineChartComponentProps,
  UseAggregationProps,
} from '../types';

import { useAggregation, useFormatData, useMinMax } from './hooks';

export default function AggregateLineChart(
  props: {
    aggregation: AggregateMetricsRequest;
  } & MetricsLineChartComponentProps
) {
  const { chartOptions, dataset } = props;
  const aggregationType = props.aggregation.aggregationType;
  const { isLoading, buckets } = useAggregation(
    props as unknown as UseAggregationProps
  );
  const data = useFormatData(buckets, aggregationType);
  const minMax = useMinMax();
  if (isLoading) {
    return null;
  }
  return (
    <Line
      options={{
        ...chartOptions,
        scales: {
          x: {
            ...minMax,
            type: 'time',
            ...chartOptions?.scales?.x,
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
