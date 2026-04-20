import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/domain/**', 'src/app/**', 'src/infra/**', 'src/ui/**'],
      exclude: ['**/*.test.ts', '**/*.spec.ts']
    }
  }
});
