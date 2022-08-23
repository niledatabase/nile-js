import {
  DataPoint,
  DataPointType,
  Histogram,
  MetricData,
  ResourceMetrics,
  ScopeMetrics,
} from '@opentelemetry/sdk-metrics';
import { Metric, MetricTypeEnum } from '@theniledev/js';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import { Attributes, AttributeValue } from '@opentelemetry/api';

import { NileMetricAttribs } from './types';

const NILE_METRIC_TYPE_MAPPING: { [key in DataPointType]: MetricTypeEnum } = {
  [DataPointType.SUM]: MetricTypeEnum.Sum,
  [DataPointType.GAUGE]: MetricTypeEnum.Gauge,
  // not yet supported
  [DataPointType.HISTOGRAM]: MetricTypeEnum.Sum,
  [DataPointType.EXPONENTIAL_HISTOGRAM]: MetricTypeEnum.Sum,
};

const NILE_INSTANCE_ID_ATTRIBUTE_KEY = 'nileInstanceId';

export function resourceMetricsToNile(
  resourceMetrics: ResourceMetrics
): Metric[] {
  return resourceMetrics.scopeMetrics.flatMap((m) => {
    return scopeMetricsToNile(m, resourceMetrics.resource.attributes);
  });
}

export function scopeMetricsToNile(
  scopeMetrics: ScopeMetrics,
  resourceAttribs: Attributes = {}
): Metric[] {
  return metricDataListToNile(scopeMetrics.metrics, resourceAttribs);
}

export function metricDataListToNile(
  metricData: MetricData[],
  resourceAttribs: Attributes = {}
): Metric[] {
  return metricData.flatMap((m) => {
    return metricDataToNile(m, resourceAttribs);
  });
}

export function metricDataToNile(
  metricData: MetricData,
  resourceAttribs: Attributes = {}
): Metric[] {
  const defaultInstanceId =
    resourceAttribs[NILE_INSTANCE_ID_ATTRIBUTE_KEY] || '';
  return metricData.dataPoints.map((dp) => {
    return {
      name: metricData.descriptor.name,
      type: NILE_METRIC_TYPE_MAPPING[metricData.dataPointType],
      startTimeNano: hrTimeToNanoseconds(dp.startTime),
      endTimeNano: hrTimeToNanoseconds(dp.endTime),
      value: transformDataPointValue(metricData.dataPointType, dp),
      instanceId: (
        dp.attributes[NILE_INSTANCE_ID_ATTRIBUTE_KEY] || defaultInstanceId
      ).toString(),
      attributes: parseDataPointAttribs(dp.attributes) as NileMetricAttribs,
    };
  });
}

function transformDataPointValue(
  pointType: DataPointType,
  point: DataPoint<number> | DataPoint<Histogram>
): number {
  switch (pointType) {
    case DataPointType.SUM:
      return point.value as unknown as number;
    case DataPointType.GAUGE:
      return point.value as unknown as number;
    default:
      throw new Error(`Unsupported data point type: ${pointType}`);
  }
}

function parseDataPointAttribs(attribs: Attributes): {
  [key: string]: AttributeValue;
} {
  return Object.entries(attribs)
    .filter(
      ([key, value]) => key !== NILE_INSTANCE_ID_ATTRIBUTE_KEY && value != null
    )
    .reduce((acc, [key, value]) => {
      acc[key] = value as AttributeValue;
      return acc;
    }, {} as { [key: string]: AttributeValue });
}
