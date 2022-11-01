import { useQuery } from '@tanstack/react-query';

import { UseAggreationReturn, UseAggregationProps } from '../types';
import { useInterval } from '../../../lib/hooks/useInterval';
import { useNile } from '../../../context';
import Queries from '../../../lib/queries';

/**
 * @example
 * import { useAggregation } from '@theniledev/react';
 * function MyChart() {
 *   const { buckets } = useAggregation({
 *     aggregation: {
 *       aggregationRequest: {
 *         startTime: new Date(),
 *         organizationId: 'myOrganization',
 *         bucketSize: '1h',
 *       },
 *       metricName: 'my.metric',
 *     },
 *     updateInterval: 4000
 *   });
 *   // rest of component
 * }
 *
 * @param props config object for hook and metrics request
 * @returns a boolean for the loading state and an array of Bucket objects
 */

export const useAggregation = (
  props: UseAggregationProps
): UseAggreationReturn => {
  const nile = useNile();

  const { updateInterval, queryKey, aggregation } = props;
  const qKey = queryKey || `aggregation:${aggregation.metricName}`;

  const {
    data = [],
    isLoading,
    refetch,
  } = useQuery(
    [Queries.FilterMetrics(qKey)],
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
