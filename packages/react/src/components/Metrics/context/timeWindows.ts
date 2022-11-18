import add from 'date-fns/add';

export const oneHourWindow = (initialDate: Date) => {
  return { startTime: initialDate, endTime: add(initialDate, { hours: 1 }) };
};
