import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import scss from 'rollup-plugin-scss'
import { terser } from 'rollup-plugin-terser'
import { defineConfig } from 'rollup';

const name = require('./package.json').main.replace(/\.js$/, '')

const configs = [
  defineConfig({
    input: 'src/index.ts',
    external: ['rxjs', 'rxjs/operators'],
    plugins: [
      scss(),
      esbuild(),
    ],
    output: [
      {
        file: `${name}.js`,
        format: 'cjs',
        sourcemap: true
      },
      {
        file: `${name}.mjs`,
        format: 'es',
        sourcemap: true,
      }
    ],
  }),
  defineConfig({
    input: 'src/index.ts',
    external: ['./scss/main.scss'],
    plugins: [
      esbuild({
        minify: true,
        target: 'es2017'
      }),
    ],
    output: [
      {
        file: `${name}.min.js`,
        format: 'iife',
        sourcemap: true,
        name: 'ReadingProgressBar'
      }
    ],
  }),
  defineConfig({
    input: 'src/index.ts',
    external: ['rxjs', 'rxjs/operators', './scss/main.scss'],
    plugins: [dts()],
    output: {
      file: `${name}.d.ts`,
      format: 'es',
    },
  })
]


export default configs;