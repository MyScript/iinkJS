/* eslint-disable object-shorthand */
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import toImport from 'postcss-import';

const plugins = [
  json(),
  resolve(),
  commonjs({
    namedExports: {
      'node_modules/loglevel/lib/loglevel.js': ['noConflict'],
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
  terser(),
  postcss({
    plugins: [toImport],
    inject: false
  })
];

export default [{
  input: 'src/myscript.js',
  output: [
    {
      name: 'MyScript',
      file: 'dist/myscript.min.js',
      format: 'umd',
      exports: 'named'
    }
  ],
  plugins
}, {
  input: 'src/myscript.js',
  output: [
    {
      file: 'dist/myscript.esm.js',
      format: 'es'
    }
  ],
  plugins
}];
