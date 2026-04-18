import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const reportPath = resolve(process.cwd(), 'coverage/frontend-benchmark.json');
const vitestCliPath = resolve(process.cwd(), 'node_modules/vitest/vitest.mjs');

const runBenchmarkHarness = () => {
  return spawnSync(
    process.execPath,
    [vitestCliPath, 'run', '--passWithNoTests', 'tests/performance/frontend-benchmark.test.ts'],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        FRONTEND_BENCHMARK_MODE: '1',
        FRONTEND_BENCHMARK_REPORT_PATH: reportPath,
      },
    },
  );
};

const benchmarkRun = runBenchmarkHarness();

if (benchmarkRun.status !== 0) {
  process.stdout.write(benchmarkRun.stdout ?? '');
  process.stderr.write(benchmarkRun.stderr ?? '');
  process.exit(benchmarkRun.status ?? 1);
}

if (!existsSync(reportPath)) {
  throw new Error(`Benchmark report was not created at ${reportPath}.`);
}

const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const initialization = report.summary.battleInitializationMs;
const turnProcessing = report.summary.turnProcessingMs;

console.log('Frontend benchmark summary');
console.log(`report: ${reportPath}`);
console.log(`iterations: ${report.iterations}`);
console.log(
  `battleInitializationMs avg/min/max: ${initialization.average} / ${initialization.min} / ${initialization.max}`,
);
console.log(
  `turnProcessingMs avg/min/max: ${turnProcessing.average} / ${turnProcessing.min} / ${turnProcessing.max}`,
);
