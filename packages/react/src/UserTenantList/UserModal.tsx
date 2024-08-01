import React from 'react';
import {
  Button,
  Stack,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
} from '@mui/joy';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';

import { useApi, useNileConfig } from '../context';

export type UserFormProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  refetch?: (user: any) => void;
};

export default function AddUser(props: UserFormProps) {
  const { open, setOpen, refetch } = props;
  const { tenantId } = useNileConfig();
  const api = useApi();
  const [errorText, setErrorText] = React.useState<void | string>();
  const { watch, register, handleSubmit } = useForm<any>();
  const email = watch('email');

  React.useEffect(() => {
    if (errorText != null) {
      setErrorText();
    }
    // if email changes, no more error
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const mutation = useMutation(
    (data: any) =>
      api.users.createTenantUser({
        createBasicUserRequest: data,
        tenantId: String(tenantId),
      }),
    {
      onSuccess(data) {
        refetch && refetch(data);
        setOpen(false);
      },
      onError(e) {
        if (e instanceof Error) {
          setErrorText(e.message);
        }
      },
    }
  );

  const handleUpdate = React.useCallback(
    async (data: any) => {
      setErrorText('');
      mutation.mutate(data);
    },
    [mutation]
  );

  return (
    <Modal open={open}>
      <ModalDialog>
        <Stack spacing={2}>
          <Typography level="h4">Create user</Typography>
          <>
            {errorText && <Typography color="danger">{errorText}</Typography>}
          </>
          <Stack
            component="form"
            sx={{
              width: '40ch',
            }}
            spacing={1}
            onSubmit={handleSubmit((data) => handleUpdate(data as any))}
          >
            <FormControl
              sx={{
                '--FormHelperText-color': 'var(--joy-palette-danger-500)',
              }}
            >
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                {...register('email')}
                fullWidth
                size="lg"
                id="email"
                name="email"
                autoComplete="current-email"
                required
                error={Boolean(errorText)}
              />
            </FormControl>
            <FormControl
              sx={{
                '--FormHelperText-color': 'var(--joy-palette-danger-500)',
              }}
            >
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                {...register('password')}
                fullWidth
                size="lg"
                id="password"
                autoComplete="current-password"
                type="password"
                required
              />
            </FormControl>
            <Stack direction="row" sx={{ pt: 2 }} spacing={2}>
              <Button onClick={() => setOpen(false)} variant="plain">
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </Stack>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
