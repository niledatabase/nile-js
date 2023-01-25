import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

import { useMetricsTime, useOneHourWindow } from '../context';

export default function StarTime() {
  const { startTime } = useMetricsTime();
  const setToHour = useOneHourWindow();
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
        <DateTimePicker
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderInput={(props: any) => {
            const { InputProps, inputRef } = props;
            return (
              <Input
                ref={inputRef}
                name="startTime"
                value={startTime.toString() ?? ''}
                id="date-picker-start-time"
                endDecorator={InputProps?.endAdornment}
              />
            );
          }}
          value={startTime}
          onChange={(newValue) => {
            setToHour(new Date(String(newValue)));
          }}
        />
        <Typography level="body3">past 1 hour</Typography>
      </Stack>
    </LocalizationProvider>
  );
}
