import React from 'react';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

export default function DefaultEmptyState() {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px',
      }}
    >
      <TroubleshootIcon sx={{ fontSize: 32 }} />
      <Typography>No results</Typography>
    </Stack>
  );
}
