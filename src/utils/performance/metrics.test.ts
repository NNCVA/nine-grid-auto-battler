import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  endMeasure,
  getMetricsSnapshot,
  getMetricsSummary,
  recordMetric,
  resetMetrics,
  startMeasure,
} from './metrics';

describe('metrics collector', () => {
  beforeEach(() => {
    resetMetrics();
  });

  it('measures a stable numeric duration between start and end', () => {
    const values = [100, 132.5];
    vi.spyOn(performance, 'now').mockImplementation(() => values.shift() ?? 132.5);

    startMeasure('battle-init');
    const duration = endMeasure('battle-init');

    expect(duration).toBe(32.5);
    expect(getMetricsSnapshot()).toEqual({
      'battle-init': [32.5],
    });
  });

  it('records manual metric values alongside measured ones', () => {
    recordMetric('render-count', 7);
    recordMetric('render-count', 4);

    expect(getMetricsSnapshot()).toEqual({
      'render-count': [7, 4],
    });
  });

  it('summarizes recorded metric values for reporting', () => {
    recordMetric('battle-init', 1.5);
    recordMetric('battle-init', 2.5);
    recordMetric('battle-init', 4);

    expect(getMetricsSummary()).toEqual({
      'battle-init': {
        average: 2.6667,
        count: 3,
        max: 4,
        min: 1.5,
        total: 8,
      },
    });
  });

  it('throws when ending a metric that was never started', () => {
    expect(() => endMeasure('missing')).toThrowError(
      'No active measurement found for "missing".',
    );
  });
});
