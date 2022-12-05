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
  BarElement,
} from 'chart.js';

import DefaultEmptyState from '../DefaultEmptyState';
import { MetricsBarChartComponentProps } from '../types';

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

export default function FilterBarChart(
  props: FilterMetricsRequest & MetricsBarChartComponentProps
) {
  const { emptyState, filter, chartOptions, dataset } = props;
  const { isLoading, metrics } = useFilter(props);
  const metricName = filter.metricName;
  const data = useFormatData(metrics);
  const minMax = useMinMax(filter);

  const sets = React.useMemo(() => {
    return data.map((datum) => {
      return {
        label: metricName,
        data: [datum],
        borderColor: '#ffb96a',
        backgroundColor: '#ff9c3f',
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

  if (metrics && metrics?.length === 0) {
    if (emptyState) {
      return <>{emptyState}</>;
    }
    return <DefaultEmptyState />;
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
