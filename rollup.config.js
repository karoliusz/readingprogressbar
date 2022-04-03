import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import scss from 'rollup-plugin-scss'

const name = require('./package.json').main.replace(/\.js$/, '')

export default [
  {
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
      },
    ],
  },
  {
    input: 'src/index.ts',
    external: ['rxjs', 'rxjs/operators', './scss/main.scss'],
    plugins: [dts()],
    output: {
      file: `${name}.d.ts`,
      format: 'es',
    },
  }
]
