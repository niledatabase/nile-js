import {
  AggregationTemporality,
  InstrumentType,
  PushMetricExporter,
  ResourceMetrics,
} from '@opentelemetry/sdk-metrics';
import nile, { Metric, NileApi } from '@theniledev/js';
import { ProduceBatchOfMetricsRequest } from '@theniledev/js/dist/generated/openapi/src';
import { ExportResultCode } from '@opentelemetry/core';

import { ExporterConfig, ResultCallback } from '../types';
import { resourceMetricsToNile } from '../transform';

import MetricsQueue from './MetricsQueue';

/**
 * NileMetricsExporter is a Push Metric Exporter that accumulates metrics in memory
 * and periodically flushes to the configured Nile backend.
 */
export class NileMetricsExporter implements PushMetricExporter {
  readonly api!: NileApi;
  readonly config!: ExporterConfig;
  private flushPending = false;
  private pendingQueue: MetricsQueue = new MetricsQueue();

  constructor(nile: NileApi, config: ExporterConfig) {
    this.api = nile;
    this.config = config;
  }

  static fromConfig(config: ExporterConfig): NileMetricsExporter {
    const n = nile({
      basePath: config.basePath || 'https://prod.thenile.dev',
      workspace: config.workspace,
      accessToken: config.accessToken,
    });
    return new NileMetricsExporter(n, config);
  }

  export(metrics: ResourceMetrics, resultCallback: ResultCallback): void {
    this.pendingQueue.add(resourceMetricsToNile(metrics), resultCallback);
    this.ensurePendingFlush();
  }

  private ensurePendingFlush() {
    if (!this.flushPending) {
      this.flushPending = true;
      setTimeout(() => {
        return this.forceFlush();
      }, this.config.flushIntervalMs);
    }
  }

  forceFlush(): Promise<void> {
    this.flushPending = false;
    const [metrics, callbacks] = this.pendingQueue.pollAll();

    return this.sendMetrics(metrics)
      .then(() => {
        callbacks.forEach((cb) =>
          cb({
            code: ExportResultCode.SUCCESS,
          })
        );
      })
      .catch((err) => {
        callbacks.forEach((cb) =>
          cb({
            code: ExportResultCode.FAILED,
            error: err,
          })
        );
      });
  }

  private sendMetrics(metrics: Metric[]): Promise<void> {
    const metricsReq: ProduceBatchOfMetricsRequest = {
      metric: metrics,
      workspace: this.config.workspace,
    };
    return this.api.metrics.produceBatchOfMetrics(metricsReq);
  }

  selectAggregationTemporality(
    instrumentType: InstrumentType
  ): AggregationTemporality {
    throw new Error(`Method not implemented for ${instrumentType}`);
  }

  shutdown(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
