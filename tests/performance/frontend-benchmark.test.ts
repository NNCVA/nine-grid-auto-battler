import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createBenchmarkScenario,
  runDeterministicBattleTurn,
} from '../../utils/performance/benchmarkScenario';
import { getMetricsSummary, recordMetric, resetMetrics } from '../../utils/performance/metrics';

const benchmarkDescribe = process.env.FRONTEND_BENCHMARK_MODE === '1' ? describe : describe.skip;
const benchmarkIterations = 250;
const benchmarkReportPath = resolve(
  process.cwd(),
  process.env.FRONTEND_BENCHMARK_REPORT_PATH ?? 'coverage/frontend-benchmark.json',
);

const measureBenchmark = (name: string, callback: () => void, iterations: number) => {
  for (let index = 0; index < iterations; index += 1) {
    const start = performance.now();
    callback();
    recordMetric(name, performance.now() - start);
  }
};

benchmarkDescribe('frontend benchmark harness', () => {
  it('writes deterministic timing output for frontend benchmarking', () => {
    resetMetrics();

    const scenario = createBenchmarkScenario();

    measureBenchmark('battleInitializationMs', () => {
      createBenchmarkScenario();
    }, benchmarkIterations);

    measureBenchmark('turnProcessingMs', () => {
      runDeterministicBattleTurn();
    }, benchmarkIterations);

    const summary = getMetricsSummary();

    mkdirSync(dirname(benchmarkReportPath), { recursive: true });
    writeFileSync(
      benchmarkReportPath,
      JSON.stringify(
        {
          iterations: benchmarkIterations,
          scenario: {
            enemySpeed: scenario.enemySpeed,
            playerSpeed: scenario.playerSpeed,
            turnOrderLength: scenario.turnOrder.length,
            unitCount: scenario.units.length,
          },
          summary,
        },
        null,
        2,
      ),
    );

    expect(summary.battleInitializationMs?.count).toBe(benchmarkIterations);
    expect(summary.turnProcessingMs?.count).toBe(benchmarkIterations);
    expect(summary.battleInitializationMs?.average).toBeGreaterThanOrEqual(0);
    expect(summary.turnProcessingMs?.average).toBeGreaterThanOrEqual(0);
  });
});
