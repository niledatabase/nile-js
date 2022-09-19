/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateHeaderRow } from '../../../src/components/InstanceTable/InstanceTable';

describe('instance table', () => {
  let entityData: any;
  beforeEach(() => {
    entityData = {
      schema: {
        type: 'object',
        properties: {
          fn: {
            description: 'Formatted Name',
            type: 'string',
          },
          familyName: {
            type: 'string',
          },
          givenName: {
            type: 'string',
          },
        },
      },
    };
  });

  it('creates headers based on a schema', () => {
    const additionalColumns: any = [];
    const columns: any = [];
    const headerRow = generateHeaderRow(additionalColumns, columns, entityData);
    expect(headerRow).toEqual([
      { field: 'fn', flex: 1, headerName: 'fn', minWidth: 200 },
      { field: 'familyName', flex: 1, headerName: 'familyName', minWidth: 200 },
      { field: 'givenName', flex: 1, headerName: 'givenName', minWidth: 200 },
    ]);
  });

  it('filters and sorts columns based on an array', () => {
    const additionalColumns: any = [];
    const columns: any = ['givenName', 'familyName'];
    const headerRow = generateHeaderRow(additionalColumns, columns, entityData);
    expect(headerRow).toEqual([
      { field: 'givenName', flex: 1, headerName: 'givenName', minWidth: 200 },
      { field: 'familyName', flex: 1, headerName: 'familyName', minWidth: 200 },
    ]);
  });
});
