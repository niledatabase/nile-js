import React from 'react';
import {
  Filter,
  FilterMetricsRequest,
  Measurement,
  Metric,
} from '@theniledev/js';

import { useNile } from '../../context';
import Queries, { useQuery } from '../../lib/queries';

type UseMetricsReturn = {
  isLoading: boolean;
  metrics: Measurement[];
};

/**
 * @example
 * ```typescript
 * import { useMetrics } from '@theniledev/react';
 * function MyChart() {
 *   const filter = {
 *     entityName="clusters",
 *     metric="my.metric"
 *   }
 *   const { isLoading, metrics } = useMetrics({
 *     filter,
 *     fromTimestamp: new Date(),
 *     duration: 60 * 1000
 *   });
 * }
 * ```
 * @param props config object for a metrics request
 * @returns a boolean for the loading state and metrics flattened into measurements
 */
export const useMetrics = (props?: FilterMetricsRequest): UseMetricsReturn => {
  const nile = useNile();

  const filter: void | Filter = props?.filter;

  // API does not like this currently
  if (filter && filter.metricName === '') {
    delete filter.metricName;
  }

  const { data: fetchedData = [], isLoading } = useQuery(
    [Queries.FilterMetrics(JSON.stringify(filter))],
    () => {
      const payload: FilterMetricsRequest = {
        ...props,
        filter: filter ? filter : {},
      } as FilterMetricsRequest;
      return nile.metrics.filterMetrics(payload);
    },
    { enabled: Boolean(nile.workspace && nile.authToken) }
  );

  const flatMetrics = React.useMemo(
    () =>
      fetchedData?.flatMap((metric: Metric) => {
        return metric.measurements;
      }),
    [fetchedData]
  );

  return { isLoading, metrics: flatMetrics };
};
