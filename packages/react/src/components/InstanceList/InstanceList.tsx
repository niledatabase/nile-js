import React from 'react';
import Stack from '@mui/joy/Stack';
import CircularProgress from '@mui/joy/CircularProgress';
import { DataGrid, GridColDef, DataGridProps } from '@mui/x-data-grid';
import { Entity, Instance, Organization } from '@theniledev/js';

import { TableWrapper } from '../../lib/table';
import { flattenSchema, flatten } from '../../lib/utils/schema';

import { InstanceListProps } from './types';

type Props = Omit<InstanceListProps, 'org'> & {
  instances: void | Instance[];
  entityData: void | Entity;
  organization: void | Organization;
  isFetching: boolean;
  dataGridProps?: DataGridProps;
};

export const generateHeaderRow = (
  additionalColumns: GridColDef[],
  columns: Array<string>,
  entityData: void | Entity,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  processColumns?: (header: string, flatSchema: any) => GridColDef
): GridColDef[] => {
  const flatSchema = entityData && flattenSchema(entityData?.schema, true);
  if (flatSchema) {
    const baseArr = Object.keys(flatSchema).map((header) => {
      if (processColumns) {
        return processColumns(header, flatSchema);
      }
      return {
        minWidth: 200,
        field: String(header),
        headerName: String(header),
        flex: 1,
      };
    });
    if (columns && columns.length > 0) {
      const colLookup = baseArr.reduce(
        (accum: { [header: string]: GridColDef }, prop) => {
          if (prop.headerName) {
            accum[prop.headerName] = prop;
          }
          return accum;
        },
        {}
      );

      return columns.reduce((accum: GridColDef[], col) => {
        if (colLookup[String(col)] != null) {
          accum.push(colLookup[String(col)]);
        }
        return accum;
      }, []);
    }
    if (additionalColumns && additionalColumns.length) {
      return baseArr.concat(additionalColumns);
    }
    return baseArr;
  }
  if (columns) {
    return columns.map((header: string | GridColDef): GridColDef => {
      if (typeof header === 'object') {
        return header;
      }
      return {
        minWidth: 200,
        field: header,
        headerName: header,
        flex: 1,
      };
    });
  }
  return [];
};

const InstanceList = React.memo(function InstanceList(props: Props) {
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
    dataGridProps = {},
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

  const headerRow = React.useMemo(
    () =>
      generateHeaderRow(
        additionalColumns ?? [],
        columns ?? [],
        entityData,
        processColumns
      ),
    [additionalColumns, columns, entityData, processColumns]
  );

  function renderEmptyState() {
    if (emptyState && organization) {
      return emptyState({ entity, organization });
    }
    if (organization) {
      return `No ${entity} found in ${organization?.name} organization`;
    }
    return `No ${entity} found`;
  }

  const styleOverrides = React.useMemo(
    () => ({
      '.MuiDataGrid-cell:focus': {
        outline: typeof handleRowClick === 'function' ? 'none' : null,
      },
      '.MuiDataGrid-row:hover': {
        cursor: typeof handleRowClick === 'function' ? 'pointer' : 'inherit',
      },
    }),
    [handleRowClick]
  );

  if (isFetching) {
    return (
      <Stack
        sx={{
          width: '100%',
          alignItems: 'center',
          justifyConent: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Stack>
    );
  }

  if (flatInstances.length === 0) {
    return <>{renderEmptyState()}</>;
  }

  return (
    <Stack spacing={2}>
      <Stack
        spacing={1}
        direction="row"
        sx={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingTop: actionButtons ? 1 : 0,
        }}
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
            sx={styleOverrides}
            rows={flatInstances}
            onRowClick={handleRowClick}
            columns={headerRow}
            hideFooter={true}
            {...dataGridProps}
          />
        </TableWrapper>
      )}
    </Stack>
  );
});
export default InstanceList;
