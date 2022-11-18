import React from 'react';
import { Line } from 'react-chartjs-2';
import { FilterMetricsRequest } from '@theniledev/js';

import { MetricsLineChartComponentProps } from '../types';

import { useFilter, useFormatData, useMinMax } from './hooks';

export default function FilterLineChart(
  props: FilterMetricsRequest & MetricsLineChartComponentProps
) {
  const { filter, chartOptions, dataset } = props;
  const { isLoading, metrics } = useFilter(props);
  const minMax = useMinMax(filter);
  const data = useFormatData(metrics);

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
