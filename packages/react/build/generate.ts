import path from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import chalk from 'chalk'
import consola from 'consola'
import camelcase from 'camelcase'
import { emptyDir, ensureDir } from 'fs-extra'
//查找工作区所有包
import { findWorkspacePackages } from '@pnpm/find-workspace-packages'
import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
//根据特定条件查找文件
import glob from 'fast-glob'
import { pathReactComponents } from '../../../sh/path'
import { optimizeSvg } from '../../../sh/svgo'
import { formatCode } from '../../../sh/format'


/**
 * 编译svg生成tsx组件流程
 * 读取svg文本 => svgo加工 => 生成tsx => prettier格式化 => 输出tsx
 * svgo加工流程
 * 删除xmlns属性 => 删除无用stroke&fill属性 => 添加svg节点的width,height,class占位文本 => 排序属性 => 替换stroke,fill,stroke-width,stroke-linecap等属性为占位文本
 *
 */
async function init() {
  consola.info(chalk.blue('generating react components'))
  //若pathComponents为空，则新建，否则不处理
  await ensureDir(pathReactComponents)
  //clear dir
  await emptyDir(pathReactComponents)

  const files = await getSvgFiles()
  consola.info(chalk.blue('generating react files'))
  await Promise.all([files.map((file) => transformToReactComponent(file))])

  consola.info(chalk.blue('generating entry files'))
  await generateEntry(files)
}

/**
 * 检索所有svg文件
 * @returns 所有svg路径数组
 */
const getSvgFiles = async () => {
  const rootDir = await findWorkspaceDir(process.cwd())
  const pkgs = await findWorkspacePackages(rootDir!)
  const pkg = pkgs.find((pkg) => pkg.manifest.name === '@lineargame/svg-icon')
  return glob('*.svg', { cwd: pkg?.dir, absolute: true })
}

/**
 * 获取后续所需的格式组件名从文件地址中
 */
const getName = (file: string) => {
  const filename = path.basename(file).replace('.svg', '')
  return {
    //原始文件名
    filename,
    //横线:eye-active
    lineName: filename,
    //小驼峰: eyeActive
    lowerName: camelcase(filename, { locale: 'en-US' }),
    //大驼峰: EyeActive
    upperName: camelcase(filename, { pascalCase: true })
  }
}

const replaceCodePlaceholderAttrs = (code: string) => {
  let str = code
  const dealCode = (c: string, reg: string, keyword: string, suffix: string) => {
    const regex = new RegExp(reg, 'g')
    const extraReg = new RegExp(`${suffix}="(.*?)"`, 'g')

    return c.replace(extraReg, (p, p1) => {
      if (!p1.includes(reg)) return p
      // consola.log(p, p1)
      const r = p1.replace(regex, keyword)
      if (suffix === 'class') {
        return `className={${r}}`
      }
      return `${suffix}={${r}}`
    })
  }
  str = dealCode(str, '_svgSize', 'width || size', 'width')
  str = dealCode(str, '_svgSize', 'height || size', 'height')
  str = dealCode(str, '_className', 'className', 'class')
  str = dealCode(str, '_fillColor', 'fill || color', 'fill')
  str = dealCode(str, '_strokeColor', 'stroke || color', 'stroke')

  //stroke="_fillColor" & fill="_strokeColor"，当stroke默认颜色是预先定义的fill颜色时 或者 当fill默认颜色是预先定义的stroke颜色时
  // 约定：#FEFEFE 为fill色，#333为stroke色
  // fill="_strokeColor || '#333'" 或  stroke="_fillColor || '#fefefe'"
  // 总之，
  // 1. 凡是#333颜色，都用stroke变量来设置动态颜色
  // 2. 凡是#fefefe颜色，都用fill变量来设置动态颜色
  str = dealCode(str, '_strokeColor', 'stroke || color', 'fill')
  str = dealCode(str, '_fillColor', 'fill || color', 'stroke')

  return str
}

//react 组件
async function transformToReactComponent(file: string) {
  const content = await readFile(file, 'utf-8')
  const { upperName } = getName(file)

  // svg加工处理
  const newContent = optimizeSvg({ svg: content, lang: 'react' })
  //格式化
  const code = `
    import React from 'react'
    import { IconProps } from '.'
    const Icon${upperName} = ({ size, width, height, color, className, fill, stroke }:IconProps) => {
      return (
        ${newContent}
      )
    }
    export default Icon${upperName}
  `
  const code1 = replaceCodePlaceholderAttrs(code)
  const forCode = await formatCode(code1, 'babel-ts')
  await writeFile(path.resolve(pathReactComponents, `${upperName}.tsx`), forCode, 'utf-8')
}

// 入口文件
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
      className?: string
      color?: string
      fill?: string
      stroke?: string
    }`,
    'typescript'
  )
  await writeFile(path.resolve(pathReactComponents, 'index.ts'), code, 'utf-8')
}

init()
