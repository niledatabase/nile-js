import React from 'react';
import { Filter } from '@theniledev/js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';

import 'chartjs-adapter-date-fns';

import FilterBarChart from './Filter/FilterBarChart';
import AggregateBarChart from './Aggregate/AggregateBarChart';
import {
  AggregateMetricsRequest,
  MetricsBarChartComponentProps,
} from './types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

/**
 *
 * @example
 * ```typescript
 * import { MetricsLineChart, NileProvider } from '@theniledev/react';
 * function MyChart() {
 *   const filter = {
 *     entityType: 'clusters',
 *     metricName: 'my.metric',
 *   };
 *
 *   return (
 *     <NileProvider baseUrl="https://prod.thenile.dev" workspace="clustify">
 *       <MetricsLineChart filter={filter} />
 *     </NileProvider>
 *   );
 * }
 * ```
 * @param props configuration for the metrics request and chart.js line
 * @returns a chart.js line
 */
export default function MetricsLineChart(
  props: {
    filter?: Filter;
    aggregation?: AggregateMetricsRequest;
  } & MetricsBarChartComponentProps
): React.ReactElement | null {
  const { filter, aggregation, ...commonProps } = props;

  if (aggregation) {
    return <AggregateBarChart {...commonProps} aggregation={aggregation} />;
  }
  if (filter) {
    return <FilterBarChart {...commonProps} filter={filter} />;
  }
  return null;
}
