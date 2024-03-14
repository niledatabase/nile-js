'use client';

import Stack from '@mui/joy/Stack';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import { useState } from 'react';

import NileContext from '@/nile/ui/NileContext';
import Alert from '@mui/joy/Alert';

type Props = {
  pitStops: {
    [name: string]: Array<{
      pit_duration: string;
      result: 'bad' | 'good';
    }>;
  };
  teamName: string;
  error?: string;
};
export default function TeamDashboard(props: Props) {
  const [showStops, setShowStops] = useState<Array<string>>([]);
  const { teamName, pitStops, error } = props;
  if (error) {
    return <Alert>{error}</Alert>;
  }
  return (
    <NileContext>
      <Box sx={{ py: 12, px: 30 }} gap={3}>
        <Typography level="h1">{teamName}</Typography>
        <Stack sx={{ flex: 1 }} gap={2}>
          {Object.keys(pitStops).map((key: string) => {
            const stops = pitStops[key];
            const bad = stops.some((stops) => stops.result === 'bad');
            return (
              <Card
                key={key}
                variant="outlined"
                sx={{ minWidth: '120px' }}
                color={bad ? 'danger' : 'success'}
                onClick={() => {
                  if (showStops.includes(key)) {
                    setShowStops((prev) => {
                      return prev.filter((_key) => _key !== key);
                    });
                  } else {
                    setShowStops((prev) => {
                      const updated = [...prev, key];
                      return updated;
                    });
                  }
                }}
              >
                <Stack>
                  <Stack direction="row" gap={5} alignItems="center">
                    <Typography>{key}</Typography>
                    <Typography level="body3">Stops: {stops.length}</Typography>
                  </Stack>
                </Stack>
                {showStops.includes(key) && (
                  <Stack>
                    {stops.map(({ result, pit_duration }, idx) => {
                      return (
                        <Stack
                          key={idx}
                          direction="row"
                          justifyContent="space-between"
                        >
                          <Typography>Duration</Typography>
                          <Typography
                            color={result === 'bad' ? 'danger' : 'success'}
                          >
                            {parseFloat(pit_duration).toFixed(2)}
                          </Typography>
                        </Stack>
                      );
                    })}
                  </Stack>
                )}
              </Card>
            );
          })}
        </Stack>
      </Box>
    </NileContext>
  );
}
