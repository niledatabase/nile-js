import { UpdateInterval } from '../types';

export const setMinRefresh = (interval: number) => {
  if (interval < UpdateInterval.ThirtySeconds) {
    // eslint-disable-next-line no-console
    console.warn(
      'Metric filter refresh interval set to 30s. Increase the interval to remove this warning.'
    );
    return UpdateInterval.ThirtySeconds;
  }
  return interval;
};
