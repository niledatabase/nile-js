import { add } from 'date-fns';

export const oneHourWindow = (initialDate: Date) => {
  return { startTime: initialDate, endTime: add(initialDate, { hours: 1 }) };
};
