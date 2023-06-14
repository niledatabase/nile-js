import { GridRowsProp, GridValidRowModel } from '@mui/x-data-grid';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';

export default function getColumnSize(
  column: string,
  rows: GridRowsProp,
  canvasContext: void | CanvasRenderingContext2D
) {
  const dataWidthReducer = (longest: string, nextRow: GridValidRowModel) => {
    let value = nextRow[column];
    if (isNull(value) || isUndefined(value)) {
      value = '';
    }
    value = value.toString();
    return longest.length > value.length ? longest : value;
  };

  let columnHeaderLen =
    canvasContext && column ? canvasContext.measureText(column).width : 50;
  /* padding 12, icon-width 15 */
  columnHeaderLen += 15 + 12;

  let width = columnHeaderLen;
  width =
    16 +
    Math.ceil(
      canvasContext
        ? canvasContext.measureText(rows.reduce(dataWidthReducer, '')).width
        : 50
    );
  if (width < columnHeaderLen) {
    width = columnHeaderLen;
  }
  /* Gracefull */
  width += 8;
  return width;
}
