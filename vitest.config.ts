import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['src/__mocks__/**', 'src/test-setup.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/navigation': path.resolve(__dirname, './src/__mocks__/next-navigation.ts'),
      'next/headers': path.resolve(__dirname, './src/__mocks__/next-headers.ts'),
      'next/image': path.resolve(__dirname, './src/__mocks__/next-image.tsx'),
      'next/dynamic': path.resolve(__dirname, './src/__mocks__/next-dynamic.tsx'),
    },
  },
});
