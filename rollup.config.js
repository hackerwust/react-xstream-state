const path = require('path');
const babel = require('rollup-plugin-babel');
const typescript = require('rollup-plugin-typescript2');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require("rollup-plugin-node-resolve");

const babelConfig = {
  plugins: [
      "@babel/plugin-external-helpers",
      [
          '@babel/plugin-transform-runtime',
          {
              // https://babeljs.io/docs/en/babel-plugin-transform-runtime#options
              corejs: 3,
              helpers: true,
              regenerator: true,
              useESModules: false
          }
      ]
  ],
  presets: [
      ['@babel/preset-env', {
          modules: false,
      }],
      '@babel/preset-react',
      '@babel/preset-typescript'
  ]
};

module.exports = {
    input: "./src/index.ts",
    external: ['react', 'react-dom', 'tslib', 'xstream'],
    output: [
      {
        file: "dist/index.esm.js",
        format: "esm",
      },
      {
        file: "dist/index.cjs.js",
        format: 'cjs',
      }
    ],
    plugins: [
        // typescript必须要放在babel前面处理
        typescript(),
        babel({
            babelrc: false,
            runtimeHelpers: true,
            externalHelpers: true,
            exclude: 'node_modules/**',
            ...babelConfig,
            // 必须加上ts后缀，babel默认不会处理ts模块
            extensions: ['.js', '.ts', '.tsx'],
        }),
        resolve(),
        commonjs()
    ]
};