import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import {
  AggregationTemporality,
  DataPoint,
  DataPointType,
  GaugeMetricData,
  InstrumentDescriptor,
  MetricData,
  ResourceMetrics,
  ScopeMetrics,
  SumMetricData,
} from '@opentelemetry/sdk-metrics';

import { ExporterConfig } from '../src';

export function genConfig(
  basePath = 'https://prod.thenile.dev',
  workspace = 'default'
): ExporterConfig {
  return {
    basePath,
    workspace,
    accessToken: genHex(32),
    instanceId: genHex(32),
    flushIntervalMs: 5000,
  };
}

export function genResourceMetrics(
  resource: Resource,
  scopeCount,
  metricsPerScope: number,
  metricGen: () => MetricData,
  scopeName = 'unit_test'
): ResourceMetrics {
  return {
    resource,
    scopeMetrics: [...Array(scopeCount)].map(() => {
      return genScopeMetrics(metricGen, metricsPerScope, scopeName);
    }),
  };
}

export function genScopeMetrics(
  metricGen: () => MetricData,
  metricCount = 1,
  scopeName = 'unit_test'
): ScopeMetrics {
  return {
    scope: {
      name: scopeName,
    },
    metrics: [...Array(metricCount)].map(metricGen),
  };
}

export function sumMetricGenerator(
  descriptor: InstrumentDescriptor,
  dataPointCount = 3,
  dataPointGen: () => DataPoint<number> = genDataPointWithId,
  temporality: AggregationTemporality = AggregationTemporality.CUMULATIVE
): () => SumMetricData {
  return () =>
    genSumMetricData(descriptor, dataPointCount, dataPointGen, temporality);
}

export function genSumMetricData(
  descriptor: InstrumentDescriptor,
  dataPointCount: number,
  dataPointGen: () => DataPoint<number> = genDataPointWithId,
  temporality: AggregationTemporality = AggregationTemporality.CUMULATIVE
): SumMetricData {
  return {
    descriptor,
    aggregationTemporality: temporality,
    dataPointType: DataPointType.SUM,
    isMonotonic: true,
    dataPoints: [...Array(dataPointCount)].map(dataPointGen),
  };
}

export function gaugeMetricGenerator(
  descriptor: InstrumentDescriptor,
  dataPointCount = 3,
  dataPointGen: () => DataPoint<number> = genDataPointWithId,
  temporality: AggregationTemporality = AggregationTemporality.CUMULATIVE
): () => GaugeMetricData {
  return () =>
    genGaugeMetricData(descriptor, dataPointCount, dataPointGen, temporality);
}

export function genGaugeMetricData(
  descriptor: InstrumentDescriptor,
  dataPointCount: number,
  dataPointGen: () => DataPoint<number> = genDataPointWithId,
  temporality: AggregationTemporality = AggregationTemporality.DELTA
): GaugeMetricData {
  return {
    descriptor,
    aggregationTemporality: temporality,
    dataPointType: DataPointType.GAUGE,
    dataPoints: [...Array(dataPointCount)].map(dataPointGen),
  };
}

export function genDataPointWithId(): DataPoint<number> {
  return {
    startTime: genHrTime(),
    endTime: genHrTime(),
    attributes: {
      nileInstanceId: genHex(32),
      key1: genHex(2),
      key2: genHex(2),
    },
    value: Math.floor(Math.random() * 1000),
  };
}

export function genDataPointNoAttribs(): DataPoint<number> {
  return {
    startTime: genHrTime(),
    endTime: genHrTime(),
    attributes: {},
    value: Math.floor(Math.random() * 1000),
  };
}

export function genSpan(): ReadableSpan {
  return {
    name: genHex(8),
    kind: SpanKind.CLIENT,
    spanContext: () => {
      return {
        traceId: genHex(32),
        spanId: genHex(16),
        traceFlags: 0,
      };
    },
    parentSpanId: genHex(8),
    startTime: genHrTime(),
    endTime: genHrTime(),
    status: {
      code: SpanStatusCode.OK,
      message: genHex(8),
    },
    attributes: {},
    links: [],
    events: [
      {
        time: genHrTime(),
        name: genHex(8),
        attributes: {},
      },
    ],
    duration: genHrTime(),
    ended: false,
    resource: Resource.empty(),
    instrumentationLibrary: {
      name: genHex(8),
    },
  };
}

export function genHex(length: number): string {
  return [...Array(length)]
    .map(() => {
      return Math.floor(Math.random() * 16).toString(16);
    })
    .join('');
}

export function genHrTime(): [number, number] {
  return [
    Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
    Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
  ];
}
