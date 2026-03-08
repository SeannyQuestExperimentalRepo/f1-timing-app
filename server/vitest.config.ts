import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/*.spec.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@f1-timing/shared': '../shared/src/index.ts'
    }
  }
});