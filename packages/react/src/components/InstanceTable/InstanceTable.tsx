import React from 'react';
import { Stack } from '@mui/joy';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Entity, Instance, Organization } from '@theniledev/js';

import { TableWrapper, TableSkeleton } from '../../lib/table';
import { flattenSchema, flatten } from '../../lib/utils/schema';

import { InstanceTableProps } from './types';

type Props = Omit<InstanceTableProps, 'org'> & {
  instances: void | Instance[];
  entityData: void | Entity;
  organization: void | Organization;
  isFetching: boolean;
};

const InstanceTable = React.memo(function InstanceTable(props: Props) {
  const {
    isFetching,
    instances,
    entityData,
    organization,
    entity,
    handleRowClick,
    additionalColumns,
    columns,
    emptyState,
    expandedView,
    showExpandedView,
    processColumns,
    actionButtons,
  } = props;

  const flatInstances = React.useMemo(() => {
    if (!instances) {
      return [];
    }
    return instances.map((instance) => {
      const result = flatten(instance.properties, true);
      const filteredCols = Object.keys(result).reduce(
        (accum: { [key: string]: unknown }, key: string) => {
          if (columns?.includes(key)) {
            accum[key] = result[key];
          }
          return accum;
        },
        {}
      );
      if (columns) {
        return { id: instance.id, ...filteredCols };
      }
      return { id: instance.id, ...result };
    });
  }, [columns, instances]);

  const headerRow = React.useMemo(() => {
    const flatSchema = entityData && flattenSchema(entityData?.schema, true);
    if (flatSchema) {
      const baseArr = Object.keys(flatSchema)
        .map((header) => {
          if (processColumns) {
            return processColumns(header, flatSchema);
          }
          return {
            minWidth: 200,
            field: String(header),
            headerName: String(header),
            flex: 1,
          };
        })
        .filter((header: GridColDef) => {
          if (columns && columns.length > 0 && header.headerName) {
            return columns.includes(header.headerName);
          }
          return true;
        });
      if (additionalColumns && additionalColumns.length) {
        return baseArr.concat(additionalColumns);
      }
      return baseArr;
    }
    return [];
  }, [additionalColumns, columns, entityData, processColumns]);

  function renderEmptyState() {
    if (emptyState && organization) {
      return emptyState({ entity, organization });
    }
    if (organization) {
      return `No ${entity} found in ${organization?.name} organization`;
    }
    return `No ${entity} found`;
  }
  return (
    <TableSkeleton isFetching={isFetching} numberOfRows={flatInstances.length}>
      {flatInstances.length === 0 ? (
        renderEmptyState()
      ) : (
        <Stack spacing={2}>
          <Stack
            spacing={1}
            direction="row"
            sx={{ justifyContent: 'flex-end', alignItems: 'center' }}
          >
            {actionButtons?.map((button, idx) => {
              return <React.Fragment key={idx}>{button}</React.Fragment>;
            })}
          </Stack>
          {showExpandedView && expandedView && instances ? (
            expandedView({ instances })
          ) : (
            <TableWrapper itemCount={flatInstances.length + 1}>
              <DataGrid
                rows={flatInstances}
                onRowClick={handleRowClick}
                columns={headerRow}
                hideFooter={true}
              />
            </TableWrapper>
          )}
        </Stack>
      )}
    </TableSkeleton>
  );
});
export default InstanceTable;
