import nile, { NileApi } from '@theniledev/js';
import { Resource } from '@opentelemetry/resources';
import {
  InstrumentDescriptor,
  InstrumentType,
} from '@opentelemetry/sdk-metrics';
import { ValueType } from '@opentelemetry/api-metrics';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';

import { ExporterConfig, NileMetricsExporter } from '../../src';
import {
  gaugeMetricGenerator,
  genConfig,
  genHex,
  genResourceMetrics,
  sumMetricGenerator,
} from '../GenerativeData';

describe('NileMetricsExporter', () => {
  let api: NileApi;
  let produceSpy: jest.SpyInstance<Promise<void>>;
  let runtimeEntity: Resource;

  const defaultConfig: ExporterConfig = genConfig();
  const counterDescrip: InstrumentDescriptor = {
    name: genHex(8),
    description: genHex(16),
    unit: genHex(8),
    type: InstrumentType.COUNTER,
    valueType: ValueType.INT,
  };

  beforeEach(() => {
    api = nile({
      basePath: defaultConfig.basePath,
      workspace: defaultConfig.workspace,
      accessToken: defaultConfig.accessToken,
    });
    runtimeEntity = new Resource({
      nileInstanceId: genHex(32),
    });
    produceSpy = jest.spyOn(api.metrics, 'produceBatchOfMetrics');
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('fromConfig', () => {
    it('generates an exporter', () => {
      const testInstance = NileMetricsExporter.fromConfig(defaultConfig);
      expect(testInstance).toBeInstanceOf(NileMetricsExporter);
      expect(testInstance.config).toEqual(defaultConfig);
    });
  });

  describe('export', () => {
    it('collects and commits on configured interval', (done) => {
      simulateMetricsSuccess();

      const testInstance = new NileMetricsExporter(api, defaultConfig);
      const sumGenerator = sumMetricGenerator(counterDescrip, 1);
      const gaugeGenerator = gaugeMetricGenerator(counterDescrip, 1);
      const sums = genResourceMetrics(runtimeEntity, 3, 2, sumGenerator);
      const gauges = genResourceMetrics(runtimeEntity, 3, 2, gaugeGenerator);
      let callbackCount = 0;
      const callback = jest.fn().mockImplementation((result: ExportResult) => {
        expect(result.code).toEqual(ExportResultCode.SUCCESS);
        callbackCount++;
        if (callbackCount === 3) {
          done();
        }
      });

      testInstance.export(sums, callback);
      testInstance.export(gauges, callback);
      testInstance.export(sums, callback);

      expect(produceSpy).not.toHaveBeenCalled();

      jest.advanceTimersByTime(defaultConfig.flushIntervalMs + 10);

      expect(produceSpy).toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled(); // handled async in callback
    });

    it('calls callback on error', (done) => {
      simulateMetricsFailure();

      const testInstance = new NileMetricsExporter(api, defaultConfig);
      const sumGenerator = sumMetricGenerator(counterDescrip, 1);
      const sums = genResourceMetrics(runtimeEntity, 3, 2, sumGenerator);
      const callback = jest.fn().mockImplementation((result: ExportResult) => {
        expect(result.code).toEqual(ExportResultCode.FAILED);
        done();
      });

      testInstance.export(sums, callback);

      jest.advanceTimersByTime(defaultConfig.flushIntervalMs + 10);
    });
  });

  function simulateMetricsSuccess() {
    produceSpy.mockResolvedValue(null);
  }

  function simulateMetricsFailure() {
    produceSpy.mockRejectedValue(new Error('oh noes!'));
  }
});
