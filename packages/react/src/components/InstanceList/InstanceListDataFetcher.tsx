import React from 'react';

import { useInterval } from '../../lib/hooks/useInterval';
import { useNile } from '../../context';
import Queries, { useQuery } from '../../lib/queries';

import InstanceList from './InstanceList';
import { InstanceListProps, ComponentProps } from './types';

export type InstanceListDataFetcherProps = InstanceListProps & {
  refreshInterval?: number;
  Component: ComponentProps;
};

export default function InstanceListDataFetcher(
  props: InstanceListDataFetcherProps
) {
  const {
    entity,
    org,
    handleRowClick,
    showExpandedView,
    additionalColumns,
    expandedView,
    columns,
    emptyState,
    useQuery: customUseQuery,
    processColumns,
    actionButtons,
    refreshInterval,
    Component = InstanceList,
  } = props;
  const nile = useNile();
  const useQueryHook = customUseQuery ?? useQuery;

  const { data: organization, isFetching: isOrgFetching } = useQueryHook(
    Queries.GetOrganization(org),
    () => nile.organizations.getOrganization({ org: String(org) })
  );

  const { data: entityData, isFetching: isEntityFetching } = useQueryHook(
    Queries.GetEntity(entity),
    () => nile.entities.getEntity({ type: String(entity) })
  );

  const {
    refetch,
    data: instances,
    isFetching: isInstancesFetching,
  } = useQueryHook(Queries.ListInstances(entity, org), () =>
    nile.entities.listInstances({
      type: String(entity),
      org: String(org),
    })
  );

  useInterval(refetch, refreshInterval);

  return (
    <Component
      instances={instances}
      entityData={entityData}
      organization={organization}
      isFetching={isEntityFetching || isOrgFetching || isInstancesFetching}
      entity={entity}
      handleRowClick={handleRowClick}
      processColumns={processColumns}
      columns={columns}
      actionButtons={actionButtons}
      expandedView={expandedView}
      showExpandedView={showExpandedView}
      additionalColumns={additionalColumns}
      emptyState={emptyState}
    />
  );
}
