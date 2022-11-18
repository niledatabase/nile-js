import sub from 'date-fns/sub';

export const makeFilter = () => {
  let date = new Date();
  return Array(20)
    .fill({})
    .map(() => {
      date = sub(date, { minutes: 3 });
      return {
        name: 'nile.system.DB.instance.accessed',
        type: 'gauge',
        entity_type: 'DB',
        measurements: [
          {
            timestamp: date,
            value: Math.floor(Math.random() * 200),
            instance_id: 'inst_02rOq6dp8HImJNJcwCzLFO',
          },
        ],
      };
    });
};

export const makeAggregate = () => {
  let date = new Date();
  return Array(20)
    .fill({})
    .map(() => {
      date = sub(date, { minutes: 3 });

      return {
        timestamp: date,
        bucket_size: '10m',
        average: Math.floor(Math.random() * 200),
        sum: Math.floor(Math.random() * 200),
        min: Math.floor(Math.random() * 200),
        max: Math.floor(Math.random() * 200),
        percentile95: Math.floor(Math.random()),
        organization_id: 'org_02rOmv5Duh7f6XiV7389co',
      };
    });
};
