import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bucket } from '@theniledev/js';

import {
  AggregationType,
  UseAggreationReturn,
  UseAggregationProps,
} from '../types';
import { useInterval } from '../../../lib/hooks/useInterval';
import { useNile } from '../../../context';
import Queries from '../../../lib/queries';
import { useMetricsTime } from '../context';
import { setMinRefresh } from '../utils';

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

  const { startTime } = useMetricsTime();
  const { queryKey, aggregation } = props;
  const updateInterval = setMinRefresh(props?.updateInterval as number);
  const qKey = queryKey || `aggregation:${aggregation.metricName}`;

  const {
    data = [],
    isLoading,
    refetch,
  } = useQuery(
    [Queries.FilterMetrics(qKey)],
    () => {
      if (startTime) {
        const clone = { ...aggregation };
        clone.aggregationRequest.startTime = startTime;
        return nile.metrics.aggregateMetrics(clone);
      }
      return nile.metrics.aggregateMetrics(aggregation);
    },
    { enabled: Boolean(nile.workspace) }
  );

  useInterval(() => {
    refetch();
  }, updateInterval);

  return { isLoading, buckets: data };
};

type LabelAndData = { x: Date; y: number }[];
export const useFormatData = (
  buckets: Bucket[],
  aggregationType: AggregationType
) => {
  return React.useMemo((): LabelAndData => {
    if (!buckets) {
      return [];
    }
    return buckets
      .map((bucket) => {
        return {
          y: Number(bucket[aggregationType]),
          x: bucket.timestamp as Date,
        };
      })
      .filter(Boolean);
  }, [aggregationType, buckets]);
};

export const useMinMax = () => {
  const { startTime, endTime } = useMetricsTime();
  return React.useMemo(() => {
    const min = startTime;
    const max = endTime;
    return {
      min,
      max,
    };
  }, [endTime, startTime]);
};
