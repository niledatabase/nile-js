import { Metric } from '@theniledev/js';

import { ResultCallback } from '../types';

export default class MetricsQueue {
  private queue: QueueItem[] = [];

  add(metrics: Metric[], callback: ResultCallback): void {
    this.queue.push({ metrics, callback });
  }

  pollAll(): [Metric[], ResultCallback[]] {
    const values = this.queue.reduce(
      (acc, curr) => {
        acc[0] = acc[0].concat(curr.metrics);
        acc[1].push(curr.callback);
        return acc;
      },
      [[], []] as [Metric[], ResultCallback[]]
    );
    this.queue = [];
    return values;
  }
}

interface QueueItem {
  metrics: Metric[];
  callback: ResultCallback;
}
