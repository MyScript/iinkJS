import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import postcss from 'rollup-plugin-postcss'
import toImport from 'postcss-import'

const plugins = [
  json(),
  resolve(),
  commonjs({
    namedExports: {
      'node_modules/loglevel/lib/loglevel.js': ['noConflict']
    }
  }),
  babel({
    exclude: 'node_modules/**',
    babelrc: false,
    runtimeHelpers: true,
    presets: [
      ['@babel/env']
    ],
    plugins: [
      '@babel/transform-runtime',
      '@babel/external-helpers'
    ]
  }),
  terser({
    keep_fnames: true
  }),
  postcss({
    plugins: [toImport],
    inject: false
  })
]

export default [{
  input: 'src/iink.js',
  output: [
    {
      name: 'iink',
      file: 'dist/iink.min.js',
      format: 'umd',
      exports: 'named'
    }
  ],
  plugins
}, {
  input: 'src/iink.js',
  output: [
    {
      file: 'dist/iink.esm.js',
      format: 'es'
    }
  ],
  plugins
}]
