import { GridRowsProp } from '@mui/x-data-grid';

export default function getColumnSize(
  column: unknown,
  rows: GridRowsProp,
  canvasContext: void | CanvasRenderingContext2D
) {
  const dataWidthReducer = (
    longest: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nextRow: { [key: string]: any }
  ) => {
    let value = nextRow[String(column)];
    if (value == null) {
      value = '';
    }
    value = value?.toString();
    return longest.length > value.length ? longest : value;
  };

  let columnHeaderLen =
    canvasContext && column
      ? canvasContext.measureText(String(column)).width
      : 50;
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
