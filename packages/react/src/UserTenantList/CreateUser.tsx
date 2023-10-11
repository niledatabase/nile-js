import React from 'react';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import { useState } from 'react';
import Add from '@mui/icons-material/Add';
import { SignUp201Response } from '@niledatabase/browser';

import UserModal from './UserModal';

type Props = {
  allowCreation: boolean;
  buttonText: string;
  onUserCreateSuccess?: (user: SignUp201Response) => void;
};
export default function CreateUser(props: Props) {
  const { allowCreation, buttonText, onUserCreateSuccess } = props;
  const [open, setOpen] = useState(false);
  if (!allowCreation) {
    return null;
  }

  return (
    <Stack alignItems="flex-end" gap={1}>
      <UserModal open={open} setOpen={setOpen} refetch={onUserCreateSuccess} />
      <Button startDecorator={<Add />} size="sm" onClick={() => setOpen(true)}>
        {buttonText}
      </Button>
    </Stack>
  );
}
