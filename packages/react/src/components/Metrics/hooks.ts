import React from 'react';
import {
  Filter,
  FilterMetricsRequest,
  Measurement,
  Metric,
} from '@theniledev/js';
import { useQuery } from '@tanstack/react-query';

import { useNile } from '../../context';
import Queries from '../../lib/queries';
import { useInterval } from '../../lib/hooks/useInterval';

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
export const useMetrics = (
  props?: FilterMetricsRequest & { updateInterval?: number }
): UseMetricsReturn => {
  const nile = useNile();

  const updateInterval = props?.updateInterval;
  const filter: void | Filter = props?.filter;

  // API does not like this currently
  if (filter && filter.metricName === '') {
    delete filter.metricName;
  }

  const {
    data: fetchedData = [],
    isLoading,
    refetch,
  } = useQuery(
    [Queries.FilterMetrics(JSON.stringify(filter))],
    () => {
      const payload: FilterMetricsRequest = {
        ...props,
        filter: filter ? filter : {},
      } as FilterMetricsRequest;
      return nile.metrics.filterMetrics(payload);
    },
    { enabled: Boolean(nile.workspace) }
  );

  const flatMetrics = React.useMemo(
    () =>
      fetchedData?.flatMap((metric: Metric) => {
        return metric.measurements;
      }),
    [fetchedData]
  );

  useInterval(() => {
    refetch();
  }, updateInterval);

  return { isLoading, metrics: flatMetrics };
};
