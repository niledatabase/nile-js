import { AggregateMetricsRequest as NileAggregateMetricsRequest } from '@theniledev/js';
import { ChartDataset, ChartOptions } from 'chart.js';

export type MetricsComponentProps = {
  timeFormat?: string;
  dataset?: Omit<ChartDataset<'line', number[]>, 'data'>;
  updateInterval?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartOptions?: ChartOptions<any>;
  queryKey?: string;
};

export enum AggregationType {
  Min = 'min',
  Max = 'max',
  Sum = 'sum',
  Avg = 'average',
  P95 = 'percentile95',
}

export type AggregateMetricsRequest = NileAggregateMetricsRequest & {
  aggregationType: AggregationType;
};

export enum DataKeys {
  timestamp = 'timestamp',
  value = 'value',
  instanceId = 'instanceId',
  attributes = 'attributes',
}
