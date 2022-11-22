import { UpdateInterval } from '../../components/Metrics/types';

export const allowedUpdateInterval = (updateInterval: void | number) => {
  if (updateInterval < UpdateInterval.ThirtySeconds) {
    // eslint-disable-next-line no-console
    console.warn(
      'Interval not used. The interval must be at least 30 seconds.'
    );
    return;
  }
  return updateInterval;
};
