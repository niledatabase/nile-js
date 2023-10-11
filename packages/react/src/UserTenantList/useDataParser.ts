import { useMemo } from 'react';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { IdentifyUser200Response } from '@niledatabase/browser';

import getColumnSize from '../utils/getColumnSize';
import useTextSizer from '../hooks/useTextSizer';

export const internalRowId = '_nile_data_grid_identifier';

type Cleaned = { [key: string]: string | Set<string> };

const makeRenderable = (vals: IdentifyUser200Response) => {
  return Object.keys(vals).reduce((cleaned: Cleaned, key) => {
    const val = (vals as Cleaned)[key];
    if (val instanceof Set) {
      cleaned[key] = Array.from(val).join(', ');
    } else if (Array.isArray(val)) {
      cleaned[key] = val.join(', ');
    } else {
      cleaned[key] = val;
    }
    return cleaned;
  }, {});
};

const parseResults = (
  data: void | IdentifyUser200Response[],
  ctx: CanvasRenderingContext2D | void,
  include: string[]
): [GridColDef[], GridRowsProp] => {
  if (!data) {
    return [[], []];
  }
  const rows = data.map(makeRenderable);
  const fields = Object.keys(rows[0]);

  const existentCols: { [key: string]: number } = {};

  const mapCols = (col: string): GridColDef | void => {
    const width = getColumnSize(col, rows, ctx);
    const name = col.slice();
    if (include.includes(name)) {
      // add spaces to the end of column names so they are not duplicated in the UI
      if (existentCols[name] == null) {
        existentCols[name] = name.length;
      } else {
        existentCols[name] += 1;
      }
      return {
        field: name.padEnd(existentCols[name]),
        headerName: name.padEnd(existentCols[name]),
        width,
      };
    }
  };
  const cols = fields?.map(mapCols).filter(Boolean) ?? [];

  return [cols as GridColDef[], rows];
};

export default function useDataParser(
  data: void | IdentifyUser200Response[],
  include: string[]
): [GridColDef[], GridRowsProp] {
  const ctx = useTextSizer();
  const [cols, rows] = useMemo(
    () => parseResults(data, ctx, include),
    [data, ctx, include]
  );
  return [cols, rows];
}
