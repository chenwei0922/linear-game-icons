import path from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import chalk from 'chalk'
import consola from 'consola'
import camelcase from 'camelcase'
import { emptyDir, ensureDir } from 'fs-extra'
import { findWorkspacePackages } from '@pnpm/find-workspace-packages'
import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
import glob from 'fast-glob'
import { pathRnComponents } from '../../../sh/path'
import { optimizeSvg } from '../../../sh/svgo'
import { formatCode } from '../../../sh/format'

/**
 * 编译svg生成RN tsx组件流程
 * 读取svg文本 => svgo加工 => 转换为react-native-svg组件 => prettier格式化 => 输出tsx
 */

// react-native-svg 支持的元素映射（小写 -> 大写组件名）
const RN_SVG_ELEMENTS: Record<string, string> = {
  svg: 'Svg',
  path: 'Path',
  rect: 'Rect',
  circle: 'Circle',
  ellipse: 'Ellipse',
  line: 'Line',
  polygon: 'Polygon',
  polyline: 'Polyline',
  g: 'G',
  defs: 'Defs',
  mask: 'Mask',
  use: 'Use',
  clippath: 'ClipPath',
  lineargradient: 'LinearGradient',
  radialgradient: 'RadialGradient',
  stop: 'Stop',
  text: 'TSpan',
  tspan: 'TSpan',
  image: 'Image',
  pattern: 'Pattern',
  symbol: 'Symbol',
  foreignobject: 'ForeignObject',
  filter: 'Filter',
  fegaussianblur: 'FeGaussianBlur',
  feoffset: 'FeOffset',
  feblend: 'FeBlend',
  fecolormatrix: 'FeColorMatrix',
  fecomposite: 'FeComposite',
  feflood: 'FeFlood',
  femerge: 'FeMerge',
  femergenode: 'FeMergeNode',
}

async function init() {
  consola.info(chalk.blue('generating react-native components'))
  await ensureDir(pathRnComponents)
  await emptyDir(pathRnComponents)

  const files = await getSvgFiles()
  consola.info(chalk.blue('generating react-native files'))
  await Promise.all([files.map((file) => transformToRnComponent(file))])

  consola.info(chalk.blue('generating entry files'))
  await generateEntry(files)
}

/**
 * 检索所有svg文件
 */
const getSvgFiles = async () => {
  const rootDir = await findWorkspaceDir(process.cwd())
  const pkgs = await findWorkspacePackages(rootDir!)
  const pkg = pkgs.find((pkg) => pkg.manifest.name === '@lineargame/svg-icon')
  return glob('*.svg', { cwd: pkg?.dir, absolute: true })
}

/**
 * 获取组件名
 */
const getName = (file: string) => {
  const filename = path.basename(file).replace('.svg', '').replace(/:/g, '')
  return {
    filename,
    lineName: filename,
    lowerName: camelcase(filename, { locale: 'en-US' }),
    upperName: camelcase(filename, { pascalCase: true })
  }
}

/**
 * 将SVG标签转换为react-native-svg组件
 * <svg> => <Svg>, <path> => <Path>, etc.
 */
const convertSvgToRnSvg = (svgContent: string) => {
  let code = svgContent

  // 收集使用到的SVG元素（用于生成import语句）
  const usedElements = new Set<string>()

  // 替换所有SVG元素标签为对应的RN SVG组件
  // 处理开标签和自闭合标签: <path ... /> 或 <path ...>
  for (const [lower, upper] of Object.entries(RN_SVG_ELEMENTS)) {
    // 匹配开标签 <element 或自闭标签 <element ... />
    const openTagRegex = new RegExp(`<${lower}(\\s|>|/>)`, 'gi')
    if (openTagRegex.test(code)) {
      usedElements.add(upper)
      // 重启正则（test 会移动 lastIndex）
      code = code.replace(new RegExp(`<${lower}(\\s|>|/>)`, 'gi'), `<${upper}$1`)
    }

    // 匹配闭标签 </element>
    const closeTagRegex = new RegExp(`</${lower}>`, 'gi')
    if (closeTagRegex.test(code)) {
      code = code.replace(new RegExp(`</${lower}>`, 'gi'), `</${upper}>`)
    }
  }

  // 移除 Svg 自身（通过 import Svg 默认导入）
  usedElements.delete('Svg')

  return { code, usedElements }
}

const replaceCodePlaceholderAttrs = (code: string) => {
  let str = code
  const dealCode = (c: string, reg: string, keyword: string, suffix: string) => {
    const regex = new RegExp(reg, 'g')
    const extraReg = new RegExp(`${suffix}="(.*?)"`, 'g')

    return c.replace(extraReg, (p, p1) => {
      if (!p1.includes(reg)) return p
      const r = p1.replace(regex, keyword)
      // RN 中没有 className，只有 style；这里 class 占位符改为 style
      if (suffix === 'class') {
        return `style={${r}}`
      }
      return `${suffix}={${r}}`
    })
  }
  str = dealCode(str, '_svgSize', 'width || size', 'width')
  str = dealCode(str, '_svgSize', 'height || size', 'height')
  str = dealCode(str, '_className', 'style', 'class')
  str = dealCode(str, '_fillColor', 'fill || color', 'fill')
  str = dealCode(str, '_strokeColor', 'stroke || color', 'stroke')

  str = dealCode(str, '_strokeColor', 'stroke || color', 'fill')
  str = dealCode(str, '_fillColor', 'fill || color', 'stroke')

  // 处理 style 属性: style="{{ ... }}" => style={{ ... }}
  str = str.replace(/style="(\{\{.*?\}\})"/g, 'style=$1')

  return str
}

/**
 * RN SVG 后处理：修复 react-native-svg 类型不兼容的属性
 * 1. style={{ opacity: X }} => opacity={X} (RN SVG 元素用直接 prop)
 * 2. style={{ maskType: 'X' }} => maskType="X"
 * 3. 移除 colorInterpolationFilters（react-native-svg 类型中不支持）
 */
const postProcessRnCode = (code: string) => {
  let str = code

  // 1. 将 style={{ opacity: X }} 转换为 opacity={X}
  str = str.replace(/style=\{\{\s*opacity:\s*([\d.]+)\s*\}\}/g, 'opacity={$1}')

  // 2. 将 style={{ maskType: 'X' }} 转换为 maskType="X"
  str = str.replace(/style=\{\{\s*maskType:\s*'(\w+)'\s*\}\}/g, 'maskType="$1"')

  // 3. 将 style={{ maskType: 'X', opacity: Y }} 这种混合情况也处理
  str = str.replace(/style=\{\{\s*maskType:\s*'(\w+)',\s*opacity:\s*([\d.]+)\s*\}\}/g, 'maskType="$1" opacity={$2}')
  str = str.replace(/style=\{\{\s*opacity:\s*([\d.]+),\s*maskType:\s*'(\w+)'\s*\}\}/g, 'opacity={$1} maskType="$2"')

  // 4. 移除 colorInterpolationFilters 属性（RN SVG 不支持）
  str = str.replace(/\s*colorInterpolationFilters="[^"]*"/g, '')

  return str
}

/**
 * 将单个SVG文件转换为RN组件
 */
async function transformToRnComponent(file: string) {
  const content = await readFile(file, 'utf-8')
  const { upperName } = getName(file)

  // svg加工处理（复用rn mode的svgo）
  const newContent = optimizeSvg({ svg: content, lang: 'rn' })

  // 将 SVG 标签转换为 react-native-svg 组件
  const { code: rnSvgContent, usedElements } = convertSvgToRnSvg(newContent)

  // 生成 import 语句
  const namedImports = usedElements.size > 0 ? `, { ${[...usedElements].sort().join(', ')} }` : ''

  const code = `
    import React from 'react'
    import type { ViewStyle } from 'react-native'
    import Svg${namedImports} from 'react-native-svg'
    import { IconProps } from '.'
    const Icon${upperName}: React.FC<IconProps> = ({ size, width, height, color, style, fill, stroke }) => {
      return (
        ${rnSvgContent}
      )
    }
    export default Icon${upperName}
  `

  const code1 = replaceCodePlaceholderAttrs(code)
  const code2 = postProcessRnCode(code1)
  const forCode = await formatCode(code2, 'babel-ts')
  await writeFile(path.resolve(pathRnComponents, `${upperName}.tsx`), forCode, 'utf-8')
}

/**
 * 生成入口文件
 */
async function generateEntry(files: string[]) {
  const content = files
    .map((file) => {
      const { upperName } = getName(file)
      return `export {default as Icon${upperName}} from './${upperName}'`
    })
    .join('\n')

  const code = await formatCode(
    `${content} 
    export type IconProps = {
      size?: number
      width?: number
      height?: number
      style?: any
      color?: string
      fill?: string
      stroke?: string
    }`,
    'typescript'
  )
  await writeFile(path.resolve(pathRnComponents, 'index.ts'), code, 'utf-8')
}

init()
