import chalk from 'chalk'
import consola from 'consola'
import { emptyDir, ensureDir } from 'fs-extra'
import { BuildOptions, Format, build } from 'esbuild'
import path from 'path'
import { version } from '../package.json'
import { pathRnDist, pathRnSrc } from '../../../sh/path'

async function init() {
  consola.info(chalk.blue('cleaning dist...'))
  await ensureDir(pathRnDist)
  await emptyDir(pathRnDist)
  consola.info(chalk.blue('building...'))
  await Promise.all([buildBundle(false), buildBundle(true)])
  consola.info(chalk.blue('build successful'))
}

async function buildBundle(minify: boolean) {
  const getBuildOptions = (format: Format) => {
    const options: BuildOptions = {
      entryPoints: [path.resolve(pathRnSrc, 'index.ts')],
      entryNames: `[name]${minify ? '.min' : ''}`,
      outdir: pathRnDist,
      bundle: true,
      target: 'es2018',
      platform: 'neutral',
      format,
      minifySyntax: true,
      minify,
      treeShaking: true,
      banner: { js: `/*! @yoroll rn-icon v${version}  */\n` },
      plugins: [],
      // RN 包需要排除 react, react-native, react-native-svg
      external: ['react', 'react-native', 'react-native-svg']
    }
    return options
  }

  await Promise.all([
    // esm格式
    build({
      ...getBuildOptions('esm'),
      minify
    }),
    // cjs格式
    build({ ...getBuildOptions('cjs'), minify, outExtension: { '.js': '.cjs' } })
  ])
}

init()
