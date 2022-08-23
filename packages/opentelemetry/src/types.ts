import { Metric } from '@theniledev/js';
import { ExportResult } from '@opentelemetry/core';

/**
 * Options for Jaeger configuration
 */
export interface ExporterConfig {
  /**
   * The base path of the Nile host endpoint, i.e. https://prod.thenile.dev.
   */
  basePath?: string;
  /**
   * The Nile instance id for the calling context.
   */
  instanceId: string;
  /**
   * The Nile workspace associated with the metrics.
   */
  workspace: string;
  /**
   * Token to send as part of "Bearer" authentication to the collector endpoint.
   */
  accessToken: string;
  /**
   * Attributes applied to all metrics in the current context.
   */
  attributes?: Record<string, string>;
  /**
   * The number of milliseconds to wait before flushing metrics to the backend.
   */
  flushIntervalMs: number;
}

export type NileMetricAttribs = Pick<Metric, 'attributes'>;

export type ResultCallback = (result: ExportResult) => void;
