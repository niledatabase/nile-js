import React from 'react';
import {
  Filter,
  FilterMetricsRequest,
  Measurement,
  Metric,
} from '@theniledev/js';
import { useQuery } from '@tanstack/react-query';
import { addMilliseconds } from 'date-fns';

import { useMetricsTime, useMetricsUpdateInterval } from '../context';
import { useNile } from '../../../context';
import Queries from '../../../lib/queries';
import { useInterval } from '../../../lib/hooks/useInterval';
import { UseMetricsProps, UseMetricsReturn } from '../types';

type LabelAndData = { x: Date; y: number }[];

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
 *  // rest of component
 * }
 * ```
 * @param props config object for a metrics request
 * @returns a boolean for the loading state and metrics flattened into measurements
 */

export const useFilter = (props: UseMetricsProps): UseMetricsReturn => {
  const { filter } = props;
  const nile = useNile();
  const updateInterval = useMetricsUpdateInterval();

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

export const useMinMax = (filter: Filter) => {
  const { startTime, endTime } = useMetricsTime();
  return React.useMemo(() => {
    const min = startTime;
    const max = endTime;

    if (filter?.duration) {
      return {
        min,
        max: addMilliseconds(filter?.startTime as Date, filter?.duration),
      };
    }
    return {
      min,
      max,
    };
  }, [endTime, filter?.duration, filter?.startTime, startTime]);
};

export const useFormatData = (metrics: void | Measurement[]) => {
  return React.useMemo<LabelAndData>(() => {
    if (!metrics) {
      return [];
    }

    return metrics.map((metric) => {
      return { y: metric.value, x: metric.timestamp };
    });
  }, [metrics]);
};
