import React from 'react';

import { useNile } from '../../context';
import Queries, { useQuery } from '../../lib/queries';

import InstanceTable from './InstanceTable';
import { InstanceTableProps } from './types';

export type InstanceTableDataFetcherProps = InstanceTableProps;
export default function InstanceTableDataFetcher(
  props: InstanceTableDataFetcherProps
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

  const { data: instances, isFetching: isInstancesFetching } = useQueryHook(
    Queries.ListInstances(entity, org),
    () =>
      nile.entities.listInstances({
        type: String(entity),
        org: String(org),
      })
  );
  return (
    <InstanceTable
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
