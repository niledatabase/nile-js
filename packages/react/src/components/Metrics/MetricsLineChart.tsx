import React from 'react';
import { Filter } from '@theniledev/js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import FilterLineChart from './FilterLineChart';
import AggregateLineChart from './AggregateLineChart';
import { AggregateMetricsRequest, MetricsComponentProps } from './types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
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
  } & MetricsComponentProps
): React.ReactElement | null {
  const { filter, aggregation, ...commonProps } = props;

  if (aggregation) {
    return <AggregateLineChart {...commonProps} aggregation={aggregation} />;
  }
  if (filter) {
    return <FilterLineChart {...commonProps} filter={filter} />;
  }
  return null;
}
