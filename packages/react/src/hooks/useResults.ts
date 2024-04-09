import { useMemo } from 'react';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';

import getColumnSize from '../utils/getColumnSize';

import useTextSizer from './useTextSizer';

export const internalRowId = '_nile_data_grid_identifier';

enum Commands {
  insert = 'INSERT',
  update = 'UPDATE',
  delete = 'DELETE',
  create = 'CREATE',
  drop = 'DROP',
  alter = 'ALTER',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
// a result set that comes from the node pg
type ResultSet =
  | null
  | Record<string, never>
  | {
      command: Commands;
      rowCount: number;
      oid: number;
      rows: Any[];
      fields: Any[];
      RowCtor: null;
      rowAsArray: boolean;
    };

const parseResults = (
  resultSet: null | ResultSet,
  ctx: CanvasRenderingContext2D | void
) => {
  if (!resultSet) {
    return [[], []];
  }
  const fields = resultSet?.fields;
  const items = resultSet?.rows;

  const mapRows = (row: Any, idx: number) => {
    if (Array.isArray(row)) {
      return row.map((row, id) => ({ ...row, id: `${idx}-${id}` }));
    }
    return Object.keys(row).reduce((accum: { [key: string]: string }, name) => {
      accum[name] = row[name];
      if (row[name] && typeof row[name] === 'object') {
        accum[name] = JSON.stringify(row[name]);
      }
      // useful for getRowId
      accum[internalRowId] = String(idx);

      return accum;
    }, {});
  };
  const rows = Array.isArray(items) ? items.map(mapRows) : [];

  const existentCols: { [key: string]: number } = {};

  const mapCols = (col: Any) => {
    const width = getColumnSize(col, rows, ctx);
    const name = col.name.slice();
    // add spaces to the end of column names so they are not duplicated in the UI
    if (existentCols[name] == null) {
      existentCols[name] = name.length;
    } else {
      existentCols[name] += 1;
    }
    return {
      ...col,
      field: name.padEnd(existentCols[name]),
      headerName: name.padEnd(existentCols[name]),
      width,
    };
  };
  const cols = Array.isArray(fields) ? fields.map(mapCols) : [];
  return [cols, rows];
};

export default function useResults(
  resultSet: null | ResultSet
): [GridColDef[], GridRowsProp] {
  const ctx = useTextSizer();
  const [cols, rows] = useMemo(
    () => parseResults(resultSet, ctx),
    [resultSet, ctx]
  );
  return [cols, rows];
}
