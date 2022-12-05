import React from 'react';
import { Line } from 'react-chartjs-2';

import {
  AggregateMetricsRequest,
  MetricsLineChartComponentProps,
  UseAggregationProps,
} from '../types';
import DefaultEmptyState from '../DefaultEmptyState';

import { useAggregation, useFormatData, useMinMax } from './hooks';

export default function AggregateLineChart(
  props: {
    aggregation: AggregateMetricsRequest;
  } & MetricsLineChartComponentProps
) {
  const { chartOptions, dataset, emptyState } = props;
  const aggregationType = props.aggregation.aggregationType;
  const { isLoading, buckets } = useAggregation(
    props as unknown as UseAggregationProps
  );
  const data = useFormatData(buckets, aggregationType);
  const minMax = useMinMax();

  if (isLoading) {
    return null;
  }

  if (buckets && buckets?.length === 0) {
    if (emptyState) {
      return <>{emptyState}</>;
    }
    return <DefaultEmptyState />;
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
            borderColor: '#ffb96a',
            backgroundColor: '#ff9c3f',
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
