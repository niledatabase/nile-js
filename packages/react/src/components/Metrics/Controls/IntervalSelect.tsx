import React from 'react';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

import { UpdateInterval } from '../types';
import {
  useMetricsUpdateInterval,
  useSetMetricsUpdateInterval,
} from '../context';

const options = [
  {
    label: '30s',
    value: UpdateInterval.ThirtySeconds,
  },
  {
    label: '1m',
    value: UpdateInterval.OneMinute,
  },
  {
    label: '5m',
    value: UpdateInterval.FiveMinutes,
  },
];

export default function IntervalSelect() {
  const setMin = useSetMetricsUpdateInterval();
  const metricsInterval = useMetricsUpdateInterval();

  React.useEffect(() => {
    setMin(UpdateInterval.OneMinute);
  }, [setMin]);

  // wait for metrics to be there
  if (!metricsInterval) {
    return null;
  }
  return (
    <Select
      value={metricsInterval}
      onChange={(_, newVal) => {
        const num = Number(newVal);
        if (!isNaN(num)) {
          setMin(num);
        }
      }}
    >
      {options.map((option) => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
  );
}
