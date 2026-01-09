
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const dir = dirname(fileURLToPath(import.meta.url))

export const pathRoot = resolve(dir, '..')
export const pathSh = resolve(pathRoot, 'sh')
export const pathPkg = resolve(pathRoot, 'packages')
export const pathExample = resolve(pathRoot, 'example')

export const pathSvg = resolve(pathPkg, 'svg')
export const pathSvgSrc = resolve(pathSvg, 'src')
export const pathSvgDist = resolve(pathSvg, 'dist')
export const pathSvgComponents = resolve(pathSvgSrc, 'components')

export const pathReact = resolve(pathPkg, 'react')
export const pathReactSrc = resolve(pathReact, 'src')
export const pathReactDist = resolve(pathReact, 'dist')
export const pathReactComponents = resolve(pathReactSrc, 'components')

export const pathExampleReact = resolve(pathExample, 'react-next-demo')
export const pathExampleDist = resolve(pathExample, 'dist')

