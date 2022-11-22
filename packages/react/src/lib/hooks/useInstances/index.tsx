import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { allowedUpdateInterval } from '../../utils/refresh';
import { useNile } from '../../../context';
import Queries from '../../queries';
import { useInterval } from '../useInterval';

type Props = {
  useQuery?: typeof useQuery;
  refreshInterval?: number;
};

export const useInstances = (
  orgId: string,
  entityType: string,
  props?: Props
) => {
  const { useQuery: customUseQuery, refreshInterval } = props ?? {};
  const nile = useNile();
  const useQueryHook = customUseQuery ?? useQuery;

  const interval = React.useMemo(() => {
    return allowedUpdateInterval(refreshInterval);
  }, [refreshInterval]);

  const { refetch, data, isFetching } = useQueryHook(
    Queries.ListInstances(orgId, entityType),
    () =>
      nile.entities.listInstances({
        type: entityType,
        org: orgId,
      })
  );

  useInterval(refetch, interval);

  return { data, refetch, isFetching };
};
