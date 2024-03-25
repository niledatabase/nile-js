import { DataGrid } from '@mui/x-data-grid';
import React from 'react';
import Stack from '@mui/joy/Stack';
import {
  IdentifyUser200Response,
  SignUp201Response,
} from '@niledatabase/browser';
import { SxProps } from '@mui/system/styleFunctionSx/styleFunctionSx';
import { Theme } from '@mui/system/createTheme';

import CreateUser from './CreateUser';
import useDataParser from './useDataParser';

type ColumnNames = string;

type Props = {
  data: void | IdentifyUser200Response[];
  allowCreation?: boolean;
  buttonText?: string;
  onUserCreateSuccess?: (user: SignUp201Response) => void;
  slots?: {
    dataGrid?: SxProps<Theme>;
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
    include = ['email', 'preferedName'],
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
