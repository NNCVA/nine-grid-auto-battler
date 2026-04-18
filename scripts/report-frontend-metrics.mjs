import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const coverageSummaryPath = path.join(projectRoot, 'coverage', 'coverage-summary.json');
const distManifestCandidates = [
  path.join(projectRoot, 'dist', '.vite', 'manifest.json'),
];
const distHtmlPath = path.join(projectRoot, 'dist', 'index.html');
const distAssetsPath = path.join(projectRoot, 'dist', 'assets');

const formatPercent = (value) => `${Number(value).toFixed(2)}%`;
const formatBytes = (value) => `${(value / 1024).toFixed(2)} KiB`;

const printCoverageSummary = () => {
  if (!existsSync(coverageSummaryPath)) {
    console.log('Coverage summary: not found (run `npm test -- --coverage` first)');
    return;
  }

  const summary = JSON.parse(readFileSync(coverageSummaryPath, 'utf8'));
  const total = summary.total;

  console.log('Coverage summary:');
  console.log(`  lines: ${formatPercent(total.lines.pct)}`);
  console.log(`  statements: ${formatPercent(total.statements.pct)}`);
  console.log(`  functions: ${formatPercent(total.functions.pct)}`);
  console.log(`  branches: ${formatPercent(total.branches.pct)}`);
};

const printBuildSummary = () => {
  if (!existsSync(distHtmlPath)) {
    console.log('Build summary: dist output not found (run `npm run build` first)');
    return;
  }

  const htmlSize = readFileSync(distHtmlPath).byteLength;
  console.log('Build summary:');
  console.log(`  dist/index.html: ${formatBytes(htmlSize)}`);

  for (const manifestPath of distManifestCandidates) {
    if (!existsSync(manifestPath)) {
      continue;
    }

    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    for (const entry of Object.values(manifest)) {
      if (!entry || typeof entry !== 'object' || !('file' in entry)) {
        continue;
      }

      const assetPath = path.join(projectRoot, 'dist', entry.file);
      if (!existsSync(assetPath)) {
        continue;
      }

      const assetSize = readFileSync(assetPath).byteLength;
      console.log(`  ${entry.file}: ${formatBytes(assetSize)}`);
    }
    return;
  }

  if (existsSync(distAssetsPath)) {
    const assetFiles = readdirSync(distAssetsPath)
      .map((name) => ({
        name,
        fullPath: path.join(distAssetsPath, name),
      }))
      .filter(({ fullPath }) => statSync(fullPath).isFile());

    for (const asset of assetFiles) {
      const assetSize = readFileSync(asset.fullPath).byteLength;
      console.log(`  assets/${asset.name}: ${formatBytes(assetSize)}`);
    }
    return;
  }

  console.log('  asset manifest not found; only index.html size reported');
};

printCoverageSummary();
printBuildSummary();
