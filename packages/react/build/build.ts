import chalk from 'chalk'
import consola from 'consola'
import { emptyDir, ensureDir } from 'fs-extra'
import { BuildOptions, Format, build } from 'esbuild'
import path from 'path'
import { version } from '../package.json'
import { pathReactDist, pathReactSrc } from '../../../sh/path'

async function init() {
  consola.info(chalk.blue('cleaning dist...'))
  await ensureDir(pathReactDist)
  await emptyDir(pathReactDist)
  consola.info(chalk.blue('building...'))
  await Promise.all([buildBundle(false), buildBundle(true)])
  consola.info(chalk.blue('build successful'))
}

async function buildBundle(minify: boolean) {
  const getBuildOptions = (format: Format) => {
    const options: BuildOptions = {
      //入口文件的路径数组，即打包的起点
      entryPoints: [path.resolve(pathReactSrc, 'index.ts')],
      //生成的输出文件的名称,[name]为入口文件名称
      entryNames: `[name]${minify ? '.min' : ''}`,
      //输出文件的目录路径
      outdir: pathReactDist,
      //是否将所有模块打包到一个文件中
      bundle: true,
      //打包后的代码要支持的目标环境
      target: 'es2018',
      //打包的平台，neutral表示通用平台，browser为浏览器平台，node为nodejs平台
      platform: 'neutral',
      //指定输出的模块格式，esm为ES模块，cjs为commonjs模块,iife为浏览器模块
      format,
      //指定是否要对输出进行代码压缩
      // minify: true,
      //指定是否对输出进行语法压缩
      minifySyntax: true,
      minify,
      treeShaking: true,
      //指定在输出文件的顶部添加的文本
      banner: { js: `/*! @lineargame svg icons react v${version}  */\n` },
      //指定要使用的插件
      plugins: []
      //指定要排除的外部依赖项, ['vue']表示将Vue作为外部依赖项，不进行打包
      // external: ['vue']
      //显示指定输出文件扩展名，默认情况跟format跟target自动推断扩展名
      // outExtension: { '.js': '.mjs' }
    }
    if (format === 'iife') {
      // options.plugins!.push(GlobalsPlugin({ vue: 'Vue' }))
    } else {
      options.external = ['react', 'react-dom']
    }
    return options
  }

  await Promise.all([
    //esm格式
    build({
      ...getBuildOptions('esm'),
      minify
    }),
    //cjs格式
    build({ ...getBuildOptions('cjs'), minify, outExtension: { '.js': '.cjs' } }),
    //iife格式
    build({ ...getBuildOptions('iife'), entryNames: `[name].iife${minify ? '.min' : ''}`, minify })
  ])
}

init()
