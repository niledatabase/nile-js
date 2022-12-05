import React from 'react';
import { Line } from 'react-chartjs-2';
import { FilterMetricsRequest } from '@theniledev/js';

import { MetricsLineChartComponentProps } from '../types';
import DefaultEmptyState from '../DefaultEmptyState';

import { useFilter, useFormatData, useMinMax } from './hooks';

export default function FilterLineChart(
  props: FilterMetricsRequest & MetricsLineChartComponentProps
) {
  const { emptyState, filter, chartOptions, dataset } = props;
  const { isLoading, metrics } = useFilter(props);
  const minMax = useMinMax(filter);
  const data = useFormatData(metrics);

  if (isLoading) {
    return null;
  }

  if (metrics && metrics?.length === 0) {
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
