import {
  AggregateMetricsRequest as NileAggregateMetricsRequest,
  Bucket,
  FilterMetricsRequest,
  Measurement,
} from '@theniledev/js';
import { ChartDataset, ChartOptions } from 'chart.js';

export type HookConfig = {
  updateInterval?: number;
  queryKey?: string;
};

type MetricsChartCommonProps = HookConfig & {
  timeFormat?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartOptions?: ChartOptions<any>;
};

export type MetricsLineChartComponentProps = MetricsChartCommonProps & {
  dataset?: Omit<ChartDataset<'line', number[]>, 'data'>;
};

export type MetricsBarChartComponentProps = MetricsChartCommonProps & {
  dataset?: Omit<ChartDataset<'bar', number[]>, 'data'>;
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

export type UseAggregationProps = {
  aggregation: NileAggregateMetricsRequest;
} & HookConfig;

export type UseMetricsReturn = {
  isLoading: boolean;
  metrics: void | Measurement[];
};

export type UseMetricsProps = FilterMetricsRequest & HookConfig;

export type UseAggreationReturn = { isLoading: boolean; buckets: Bucket[] };
