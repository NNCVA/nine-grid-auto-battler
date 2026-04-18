import { defineConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig({
  ...viteConfig({ mode: 'test', command: 'serve' }),
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      all: true,
      include: [
        'components/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'services/**/*.{ts,tsx}',
        'utils/performance/**/*.{ts,tsx}',
        'data/**/*.{ts,tsx}',
        'constants.ts',
        'utils/i18n.ts',
      ],
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        '**/dist/**',
        '**/coverage/**',
        '**/docs/**',
        '**/scripts/**',
        '**/*.d.ts',
        '**/tests/setup.ts',
        '**/*.config.*',
        '**/index.tsx',
      ],
    },
  },
});
