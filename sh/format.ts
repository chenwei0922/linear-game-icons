import { type BuiltInParserName, format, Options } from 'prettier'

const FormatConfig = {
  // 参考：https://prettier.io/docs/en/options.html
  // 一行最多 120 字符
  printWidth: 120,
  // 使用 2 个空格缩进
  tabWidth: 2,
  // 不使用缩进符，而使用空格
  useTabs: false,
  // 行尾不需要分号
  semi: false,
  // 使用单引号
  singleQuote: true,
  // 对象的 key 仅在必要时用引号
  quoteProps: 'as-needed',
  // jsx中属性使用双引号而不是单引号
  jsxSingleQuote: false,
  // 末尾不需要逗号
  trailingComma: 'none',
  // 大括号内的首尾需要空格
  bracketSpacing: true,
  // 在jsx中把'>' 是否单独放一行
  jsxBracketSameLine: false,
  // 箭头函数的参数是否需要括号括起来，即使只有一个参数也要有括号
  arrowParens: 'always',
  // 每个文件格式化的范围是文件的全部内容
  rangeStart: 0,
  rangeEnd: Infinity,
  // 不需要写文件开头的 @prettier
  requirePragma: false,
  // 不需要自动在文件开头插入 @prettier
  insertPragma: false,
  // 使用默认的折行标准
  proseWrap: 'preserve',
  // 根据显示样式决定 html 要不要折行
  htmlWhitespaceSensitivity: 'css',
  // 换行符使用 lf
  endOfLine: 'lf'
}

export const formatCode = (code: string, parser: BuiltInParserName = 'babel-ts') => {
  //parser: 'babel-ts' | 'vue' | 'typescript'
  return format(code, {
    parser,
    plugins: [],
    ...(FormatConfig as Options)
  })
}
