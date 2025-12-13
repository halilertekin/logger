import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'formatters/index': 'src/formatters/index.ts',
    'transports/index': 'src/transports/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  minify: true,
  treeshake: true,
  external: ['react-native'],
});
