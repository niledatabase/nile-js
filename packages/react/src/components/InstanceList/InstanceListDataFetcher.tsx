import React from 'react';

import { useNile } from '../../context';
import Queries, { useQuery } from '../../lib/queries';
import { useInstances } from '../../lib/hooks/useInstances';

import InstanceList from './InstanceList';
import { InstanceListProps } from './types';

export type InstanceListDataFetcherProps = InstanceListProps & {
  refreshInterval?: number;
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

  const { data: instances, isFetching: isInstancesFetching } = useInstances(
    org,
    entity,
    { useQuery: useQueryHook, refreshInterval }
  );

  return (
    <InstanceList
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
