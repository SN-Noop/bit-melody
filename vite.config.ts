import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as packageJson from './package.json';

export default defineConfig({
  plugins: [react(), dts({ include: ['src/lib/'] })],
  build: {
    outDir: 'dist/lib',
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve('src', 'lib/index.ts'),
      name: '@ninja/bit-melody',
      formats: ['es', 'umd'],
      fileName: (format) => `bit-melody.${format}.js`,
    },
    rollupOptions: {
      external: [...Object.keys(packageJson.peerDependencies)],
    },
  },
});
