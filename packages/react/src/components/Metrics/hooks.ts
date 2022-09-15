import React from 'react';
import {
  Filter,
  FilterMetricsRequest,
  Measurement,
  Metric,
} from '@theniledev/js';

import { useNile } from '../../context';
import Queries, { useQuery } from '../../lib/queries';

type Props = FilterMetricsRequest;
type UseMetricsReturn = {
  isLoading: boolean;
  metrics: Measurement[];
};

export const useMetrics = (props?: Props): UseMetricsReturn => {
  const nile = useNile();

  const filter: void | Filter = props?.filter;

  // API does not like this currently
  if (filter && filter.metricName === '') {
    delete filter.metricName;
  }

  const { data: fetchedData = [], isLoading } = useQuery(
    [Queries.FilterMetrics(JSON.stringify(filter))],
    () =>
      nile.metrics.filterMetrics({
        ...props,
        filter: filter ? filter : {},
      }),
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
