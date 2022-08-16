import React from 'react';
import { styled, Box, Stack, Button } from '@mui/joy';
import { Skeleton } from '@mui/material';
import Add from '@mui/icons-material/Add';

export const TableWrapper = styled('div', {
  shouldForwardProp: (prop) => prop !== 'itemCount',
})<{
  itemCount: number;
}>`
  ${(props) => ({
    marginTop: props.theme.spacing(2),
    height: Math.min(props.itemCount * 52 + 10, 600),
    width: '100%',
  })}
`;
export function TableSkeleton({
  isFetching,
  numberOfRows,
  children,
}: {
  isFetching: boolean;
  numberOfRows: number;
  children: React.ReactNode;
}) {
  if (isFetching && numberOfRows === 0) {
    return (
      <Box
        sx={{
          marginTop: 1,
          display: 'flex',
          alignItems: 'flex-end',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ marginBottom: 2 }}>
          <Skeleton animation="wave" variant="rectangular">
            <Button variant="solid" startIcon={<Add />} size="sm">
              Create instance
            </Button>
          </Skeleton>
        </Box>
        <Box width="100%">
          <Stack spacing={2}>
            <Skeleton
              animation="wave"
              variant="rectangular"
              sx={{ height: '52px' }}
            />
            <Skeleton
              animation="wave"
              variant="rectangular"
              sx={{ height: '52px' }}
            />
            <Skeleton
              animation="wave"
              variant="rectangular"
              sx={{ height: '52px' }}
            />
          </Stack>
        </Box>
      </Box>
    );
  }
  return <>{children}</>;
}
