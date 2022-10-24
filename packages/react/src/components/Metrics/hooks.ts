import React from 'react';
import {
  FilterMetricsRequest,
  Measurement,
  Metric,
  AggregationRequest,
  Bucket,
} from '@theniledev/js';
import { useQuery } from '@tanstack/react-query';

import { useNile } from '../../context';
import Queries from '../../lib/queries';
import { useInterval } from '../../lib/hooks/useInterval';

type AggregationPayload = {
  aggregation: {
    metricName: string;
    aggregationRequest: AggregationRequest;
  };
} & HookConfig;

type UseMetricsReturn = {
  isLoading: boolean;
  metrics: void | Measurement[];
};

type HookConfig = {
  updateInterval?: number;
  queryKey?: string;
};

type UseMetricsProps = FilterMetricsRequest & HookConfig;

type UseAggreationReturn = { isLoading: boolean; buckets: Bucket[] };

/**
 * @example
 * import { useAggregation } from '@theniledev/react';
 * function MyChart() {
 *   const { buckets } = useAggregation({
 *     aggregationRequest: {
 *       startTime: new Date(),
 *       organizationId: 'myOrganization',
 *       bucketSize: '1h',
 *     },
 *     metricName: 'my.metric',
 *   });
 *
 * @param props
 * @returns a boolean for the loading state and an array of Bucket objects
 */
export const useAggregation = (
  props: AggregationPayload
): UseAggreationReturn => {
  const nile = useNile();

  const { updateInterval, aggregation } = props;
  const queryKey = props.queryKey || `aggregation:${aggregation.metricName}`;

  const {
    data = [],
    isLoading,
    refetch,
  } = useQuery(
    [Queries.FilterMetrics(queryKey)],
    () => {
      return nile.metrics.aggregateMetrics(aggregation);
    },
    { enabled: Boolean(nile.workspace) }
  );

  useInterval(() => {
    refetch();
  }, updateInterval);

  return { isLoading, buckets: data };
};

/**
 * @example
 * ```typescript
 * import { useFilter } from '@theniledev/react';
 * function MyChart() {
 *   const filter = {
 *     entityName: "clusters",
 *     metric: "my.metric"
 *     startTime: new Date(),
 *     duration: 60 * 1000,
 *   };
 *
 *   const { isLoading, metrics } = useFilter({
 *     filter,
 *   });
 * }
 * ```
 * @param props config object for a metrics request
 * @returns a boolean for the loading state and metrics flattened into measurements
 */

export const useFilter = (props: UseMetricsProps): UseMetricsReturn => {
  const nile = useNile();

  const updateInterval = props?.updateInterval;
  const { filter } = props;

  const payload = React.useMemo<FilterMetricsRequest>(() => {
    // API does not like this currently
    if (filter && filter.metricName === '') {
      delete filter.metricName;
    }
    return {
      ...props,
      filter: filter ? filter : {},
    } as FilterMetricsRequest;
  }, [filter, props]);

  const queryKey = React.useMemo(
    () => props.queryKey || `filter:${filter.metricName}`,
    [filter.metricName, props.queryKey]
  );

  const { data, isLoading, refetch } = useQuery(
    [Queries.FilterMetrics(queryKey)],
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
