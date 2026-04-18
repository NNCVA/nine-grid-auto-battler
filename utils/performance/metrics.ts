const activeMeasures = new Map<string, number>();
const metricStore = new Map<string, number[]>();
const MAX_METRIC_ENTRIES = 1000;

const roundMetricValue = (value: number) => Number(value.toFixed(4));

const appendMetricValue = (name: string, value: number) => {
  const existing = metricStore.get(name) ?? [];
  existing.push(value);
  if (existing.length > MAX_METRIC_ENTRIES) {
    existing.splice(0, existing.length - MAX_METRIC_ENTRIES);
  }
  metricStore.set(name, existing);
};

export const startMeasure = (name: string) => {
  activeMeasures.set(name, performance.now());
};

export const endMeasure = (name: string) => {
  const start = activeMeasures.get(name);

  if (start === undefined) {
    throw new Error(`No active measurement found for "${name}".`);
  }

  const duration = performance.now() - start;
  activeMeasures.delete(name);
  appendMetricValue(name, duration);
  return duration;
};

export const recordMetric = (name: string, value: number) => {
  appendMetricValue(name, value);
};

export const getMetricsSnapshot = () => {
  return Object.fromEntries(
    Array.from(metricStore.entries()).map(([name, values]) => [name, [...values]]),
  );
};

export const getMetricsSummary = () => {
  return Object.fromEntries(
    Array.from(metricStore.entries()).map(([name, values]) => {
      const total = values.reduce((sum, value) => sum + value, 0);
      let min = Infinity;
      let max = -Infinity;
      for (const v of values) {
        if (v < min) min = v;
        if (v > max) max = v;
      }

      return [
        name,
        {
          average: roundMetricValue(total / values.length),
          count: values.length,
          max: roundMetricValue(max),
          min: roundMetricValue(min),
          total: roundMetricValue(total),
        },
      ];
    }),
  );
};

export const resetMetrics = () => {
  activeMeasures.clear();
  metricStore.clear();
};
