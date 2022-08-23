import {
  InstrumentDescriptor,
  InstrumentType,
  ResourceMetrics,
} from '@opentelemetry/sdk-metrics';
import { ValueType } from '@opentelemetry/api-metrics';
import { MetricTypeEnum } from '@theniledev/js';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';

import {
  metricDataToNile,
  resourceMetricsToNile,
  scopeMetricsToNile,
} from '../src/transform';

import {
  genGaugeMetricData,
  genHex,
  genDataPointNoAttribs,
  genResourceMetrics,
  genScopeMetrics,
  genSumMetricData,
  sumMetricGenerator,
} from './GenerativeData';

const counterDescrip: InstrumentDescriptor = {
  name: genHex(8),
  description: genHex(16),
  unit: genHex(8),
  type: InstrumentType.COUNTER,
  valueType: ValueType.INT,
};

function zip<T, U>(a: T[], b: U[]): [T, U][] {
  return a.map((x, i) => [x, b[i]]);
}

describe('metricDataToNile', () => {
  it('generates a Nile Metric for every data point', () => {
    const dataPointCount = 9;
    const metricData = genSumMetricData(counterDescrip, dataPointCount);
    const metrics = metricDataToNile(metricData);
    expect(metrics.length).toBe(dataPointCount);
  });
  it('transfers instrument name to all generated metrics', () => {
    const metricData = genSumMetricData(counterDescrip, 3);
    const result = metricDataToNile(metricData);
    result.forEach((metric) => {
      expect(metric.name).toEqual(metricData.descriptor.name);
    });
  });
  it('captures start and end time for each data point', () => {
    const metricData = genSumMetricData(counterDescrip, 3);
    const result = metricDataToNile(metricData);
    zip(metricData.dataPoints, result).forEach(([dp, result]) => {
      expect(result.startTimeNano).toEqual(hrTimeToNanoseconds(dp.startTime));
      expect(result.endTimeNano).toEqual(hrTimeToNanoseconds(dp.endTime));
    });
  });
  it('extracts instanceId from attributes', () => {
    const metricData = genSumMetricData(counterDescrip, 3);
    const result = metricDataToNile(metricData);
    zip(metricData.dataPoints, result).forEach(([dp, result]) => {
      expect(result.instanceId).toEqual(dp.attributes['nileInstanceId']);
    });
  });
  it('filters instance id from attributes by default', () => {
    const metricData = genSumMetricData(counterDescrip, 3);
    const result = metricDataToNile(metricData);
    zip(metricData.dataPoints, result).forEach(([dp, result]) => {
      expect(result.attributes).toEqual({
        key1: dp.attributes['key1'],
        key2: dp.attributes['key2'],
      });
    });
  });
  describe('with sum metrics', () => {
    it('identifies metric type', () => {
      const metricData = genSumMetricData(counterDescrip, 3);
      const result = metricDataToNile(metricData);
      result.forEach((metric) => {
        expect(metric.type).toEqual(MetricTypeEnum.Sum);
      });
    });
    it('extracts value from sum', () => {
      const metricData = genSumMetricData(counterDescrip, 3);
      const result = metricDataToNile(metricData);
      zip(metricData.dataPoints, result).forEach(([dp, result]) => {
        expect(result.value).toEqual(dp.value);
      });
    });
  });
  describe('with gauge metrics', () => {
    it('identifies metric type', () => {
      const metricData = genGaugeMetricData(counterDescrip, 3);
      const result = metricDataToNile(metricData);
      result.forEach((metric) => {
        expect(metric.type).toEqual(MetricTypeEnum.Gauge);
      });
    });
    it('extracts value from gauge', () => {
      const metricData = genSumMetricData(counterDescrip, 3);
      const result = metricDataToNile(metricData);
      zip(metricData.dataPoints, result).forEach(([dp, result]) => {
        expect(result.value).toEqual(dp.value);
      });
    });
  });
});

describe('scopeMetricsToNile', () => {
  it('returns an empty array when no metrics are passed', () => {
    const result = scopeMetricsToNile({
      scope: { name: 'unit_test' },
      metrics: [],
    });
    expect(result).toEqual([]);
  });

  it('transforms all data points for all metrics in scope', () => {
    const dataPointsPerMetric = 4;
    const metricCount = 3;
    const scopedMetrics = genScopeMetrics(
      sumMetricGenerator(counterDescrip, dataPointsPerMetric),
      metricCount
    );
    const result = scopeMetricsToNile(scopedMetrics);
    expect(scopedMetrics.metrics.length).toEqual(metricCount);
    expect(result.length).toEqual(metricCount * dataPointsPerMetric);
  });
});

describe('resourceMetricsToNile', () => {
  // @see https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/README.md#service
  const resource = new Resource({
    'service.name': 'some-service',
    'service.namespace': 'dev.thenile',
    'service.version': '1.0.0',
    'service.instance.id': genHex(32),
    nileInstanceId: genHex(32),
  });

  it('returns an empty array when no metrics are passed', () => {
    const metrics: ResourceMetrics = {
      resource,
      scopeMetrics: [],
    };
    const result = resourceMetricsToNile(metrics);
    expect(result).toEqual([]);
  });

  it('transforms all data points for all metrics in all scopes', () => {
    const dataPointsPerMetric = 4;
    const metricsPerScope = 3;
    const scopeCount = 7;
    const metricGenerator = sumMetricGenerator(
      counterDescrip,
      dataPointsPerMetric
    );
    const resourceMetrics = genResourceMetrics(
      resource,
      scopeCount,
      metricsPerScope,
      metricGenerator
    );
    const result = resourceMetricsToNile(resourceMetrics);
    expect(resourceMetrics.scopeMetrics.length).toEqual(scopeCount);
    expect(result.length).toEqual(
      scopeCount * metricsPerScope * dataPointsPerMetric
    );
  });

  it('prefers data point-level nileInstanceId', () => {
    const metricGenerator = sumMetricGenerator(counterDescrip, 1);
    const resourceMetrics = genResourceMetrics(resource, 1, 1, metricGenerator);
    const result = resourceMetricsToNile(resourceMetrics);
    expect(result[0].instanceId).toEqual(
      resourceMetrics.scopeMetrics[0].metrics[0].dataPoints[0].attributes
        .nileInstanceId
    );
  });

  it('falls back to resource-level nileInstanceId when not present on data points', () => {
    const metricGenerator = sumMetricGenerator(
      counterDescrip,
      1,
      genDataPointNoAttribs
    );
    const resourceMetrics = genResourceMetrics(resource, 1, 1, metricGenerator);
    const result = resourceMetricsToNile(resourceMetrics);
    expect(result[0].instanceId).toEqual(resource.attributes.nileInstanceId);
  });
});
