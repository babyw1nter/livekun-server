import fs from 'node:fs'
import path from 'node:path'
import glob from 'glob'
import { fileURLToPath } from 'url'
import { defineConfig, Plugin } from 'rollup'
import pkg from './package.json' assert { type: 'json' }
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import typescript from 'rollup-plugin-typescript2'
import del from 'rollup-plugin-delete'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const resolve = (...args: string[]) => path.resolve(__dirname, ...args)

const rootDir = path.resolve(process.cwd())
const distDir = resolve(rootDir, 'dist')

const isProd = process.env.BUILD === 'production'

console.info(`building for ${process.env.BUILD}...`)

const ts = typescript({
  check: isProd,
  tsconfig: resolve(rootDir, 'tsconfig.json'),
  tsconfigOverride: {
    compilerOptions: {
      sourceMap: isProd,
      declaration: !isProd,
      declarationMap: !isProd,
      rootDir: resolve('src')
    },
    exclude: [
      'node_modules',
      'dist',
      '**/rollup.config.ts',
      '**/__tests__',
      '**/*.test.ts',
      '**/vitest.config.ts',
      '**/scripts'
    ]
  }
})

export default defineConfig({
  input: Object.fromEntries(
    glob
      .sync('src/**/*.ts')
      .map((file) => [
        path.relative(
          'src',
          file.slice(0, file.length - path.extname(file).length)
        ),
        fileURLToPath(new URL(file, import.meta.url))
      ])
  ),
  output: {
    format: 'es',
    dir: distDir,
    sourcemap: isProd
  },
  external: Object.keys(pkg.dependencies),
  plugins: [
    json({
      namedExports: false
    }),
    nodeResolve(),
    commonjs({
      transformMixedEsModules: true
    }),
    ts,
    del({ targets: 'dist/*' })
  ]
})
