import React from 'react';
import { FilterMetricsRequest, Measurement, Metric } from '@theniledev/js';
import { useQuery } from '@tanstack/react-query';

import { useNile } from '../../context';
import Queries from '../../lib/queries';
import { useInterval } from '../../lib/hooks/useInterval';

type UseMetricsReturn = {
  isLoading: boolean;
  metrics: void | Measurement[];
};

/**
 * @example
 * ```typescript
 * import { useMetrics } from '@theniledev/react';
 * function MyChart() {
 *   const filter = {
 *     entityName: "clusters",
 *     metric: "my.metric"
 *     startTime: new Date(),
 *     duration: 60 * 1000,
 *   };
 *
 *   const { isLoading, metrics } = useMetrics({
 *     filter,
 *   });
 * }
 * ```
 * @param props config object for a metrics request
 * @returns a boolean for the loading state and metrics flattened into measurements
 */
export const useMetrics = (
  props?: FilterMetricsRequest & { updateInterval?: number; queryKey?: string }
): UseMetricsReturn => {
  const nile = useNile();

  const updateInterval = props?.updateInterval;

  const payload = React.useMemo<FilterMetricsRequest>(() => {
    const { filter } = props ?? {};

    // API does not like this currently
    if (filter && filter.metricName === '') {
      delete filter.metricName;
    }

    return {
      ...props,
      filter: filter ? filter : {},
    } as FilterMetricsRequest;
  }, [props]);

  const { data, isLoading, refetch } = useQuery(
    [Queries.FilterMetrics(props?.queryKey || props?.filter.metricName)],
    () => {
      return nile.metrics.filterMetrics(payload);
    },
    { enabled: Boolean(nile.workspace) }
  );

  const flatMetrics = React.useMemo(
    () =>
      data?.flatMap((metric: Metric) => {
        return metric.measurements;
      }),
    [data]
  );

  useInterval(() => {
    refetch();
  }, updateInterval);

  return { isLoading, metrics: flatMetrics };
};
