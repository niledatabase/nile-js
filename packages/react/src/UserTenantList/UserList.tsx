import { DataGrid } from '@mui/x-data-grid';
import React from 'react';
import Stack from '@mui/joy/Stack';
import { User } from '@niledatabase/browser';

import CreateUser from './CreateUser';
import useDataParser from './useDataParser';

type ColumnNames = string;

type Props = {
  data: void | User[];
  allowCreation?: boolean;
  buttonText?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUserCreateSuccess?: (user: any) => void;
  slots?: {
    dataGrid?: unknown;
  };
  // white list of columns to show
  include?: ColumnNames[];
};

export default function UserList(props: Props) {
  const {
    data,
    allowCreation = true,
    buttonText = 'Add a user',
    onUserCreateSuccess,
    slots,
    include = ['email', 'preferredName'],
  } = props;

  const dataGridSx = {
    width: '100%',
    height: '100%',
    ...(slots?.dataGrid ?? {}),
  };

  const [columns, rows] = useDataParser(data, include);
  return (
    <Stack flex={1}>
      <CreateUser
        allowCreation={allowCreation}
        buttonText={buttonText}
        onUserCreateSuccess={onUserCreateSuccess}
      />
      <DataGrid
        sx={dataGridSx}
        rows={rows}
        columns={columns}
        hideFooter={true}
      />
    </Stack>
  );
}
