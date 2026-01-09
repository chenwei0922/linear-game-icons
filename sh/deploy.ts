import { resolve, join } from 'path'
import chalk from 'chalk'
import { copy, emptyDir } from 'fs-extra'
import { run } from './run'
import { pathExampleReact, pathExampleDist } from './path'
import { consola } from 'consola'

async function init() {
  //vue-demo
  await buildExample(pathExampleReact, pathExampleDist)
  consola.log(chalk.green('🎈react-demo build finish ✅'))
}

async function buildExample(input: string, output: string, _flag?: string) {
  const srcdist = resolve(input, '.next')
  const outDist = output
  await emptyDir(srcdist)
  await emptyDir(outDist)

  await run('pnpm run build', input)
  await copy(srcdist, outDist)
}
init()
