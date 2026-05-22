import { defineConfig } from 'tsup';
import path from 'path';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      'formatters/index': 'src/formatters/index.ts',
      'transports/index': 'src/transports/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    platform: 'node',
    splitting: false,
    minify: true,
    treeshake: true,
    external: ['react-native'],
  },
  {
    entry: {
      'index.browser': 'src/index.ts',
      'formatters/index.browser': 'src/formatters/index.ts',
      'transports/index.browser': 'src/transports/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: false,
    sourcemap: true,
    clean: false,
    platform: 'browser',
    splitting: false,
    minify: true,
    treeshake: true,
    external: ['react-native'],
    esbuildPlugins: [
      {
        name: 'browser-providers',
        setup(build) {
          build.onResolve({ filter: /\/providers\/(fs|path|https)$/ }, (args) => {
            const providerName = args.path.split('/').pop();
            return { path: path.resolve(__dirname, 'src/providers', `${providerName}.browser.ts`) };
          });
        },
      },
    ],
  }
]);
