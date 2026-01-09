import camelcase from 'camelcase'
import { Config, optimize, PluginInfo, XastChild, XastElement, XastRoot } from 'svgo'
import tinycolor from 'tinycolor2'

const getSvgoConfig = (lang: 'react' | 'vue' = 'react') => {
  const _placeClass = lang === 'react' ? '_className' : '_class'

  const svgoConfig: Config = {
    //浮点数精度取2位
    floatPrecision: 2,
    //插件
    plugins: [
      //删除xml处理指令
      'removeXMLProcInst',
      //删除 svg 标签的 xmlns 属性
      'removeXMLNS',
      //删除无用的stoke和fill属性
      'removeUselessStrokeAndFill',
      //排序属性
      'sortAttrs',
      //添加svg节点属性配置
      {
        name: 'addAttributesToSVGElement',
        params: {
          attribute: {
            //className占位属性
            class: _placeClass,
            // width 尺寸占位属性
            width: '_svgSize',
            // height 尺寸占位属性
            height: '_svgSize'
          }
        }
      },

      //自定义插件 => 处理颜色属性
      {
        name: 'covertColorAttrsPlugin',
        fn: (root: XastRoot, params: any, info: PluginInfo) => {
          //📢:约定#fefefe为fill填充色, #333为stroke颜色(设计师)
          const colorRelations = {
            'black': '_fillColor',
            '#333': '_strokeColor'
          }
          const deal = (children: XastChild[]) => {
            children.map((n) => {
              const node = n as XastElement
              // console.log(node.attributes)
              for (const [name, value] of Object.entries(node.attributes)) {
                // 处理颜色 key 值, 如果 color, fill, stroke属性值为以上颜色值，则用占位符替换，否则不做变动
                if (['color', 'fill', 'stroke'].includes(name)) {
                  for (const [color, _placeColorName] of Object.entries(colorRelations)) {
                    // 颜色一致
                    if (tinycolor.equals(value, color)) {
                      node.attributes[name] = `${_placeColorName} || '${value}'`
                    }
                  }
                }
              }
              node.children && deal(node.children)
            })
          }
          deal(root.children)
          return null
        }
      },

      //自定义插件 => 处理其他属性配置
      {
        name: 'covertOtherAttrsPlugin',
        fn: (root: XastRoot, params: any, info: PluginInfo) => {
          const attrRelations: Record<string, string> = {
            width: '_svgSize',
            height: '_svgSize',
            class: _placeClass
          }

          const deal = (children: XastChild[]) => {
            children.map((n) => {
              const node = n as XastElement
              for (const [name, value] of Object.entries(node.attributes)) {
                // console.log(node.attributes)
                if (Object.keys(attrRelations).includes(name)) {
                  if (value.includes(attrRelations[name])) {
                    //新增的属性
                  } else {
                    if (name === 'class') {
                      node.attributes[name] = `'${value} ' + ${attrRelations[name]} `
                    } else {
                      node.attributes[name] = `${attrRelations[name]} || ${value}`
                    }
                  }
                }
              }
              node.children && deal(node.children)
            })
          }
          deal(root.children)
          return null
        }
      }
    ]
  }
  if (lang === 'react') {
    svgoConfig.plugins?.push({
      name: 'covertAttrsCamelCase',
      fn: (root: XastRoot, params: any, info: PluginInfo) => {
        const deal = (children: XastChild[]) => {
          children.map((n) => {
            const node = n as XastElement
            for (const [name, value] of Object.entries(node.attributes)) {
              // console.log('????', name)
              node.attributes[camelcase(name)] = value
              name.includes('-') && delete node.attributes[name]
            }
            node.children && deal(node.children)
          })
        }
        deal(root.children)
        return null
      }
    })
  }

  return svgoConfig;
}

export const optimizeSvg = ({ svg, lang = 'react' }: { svg: string; lang?: 'react' | 'vue' }) => {
  const config = getSvgoConfig(lang)
  const res = optimize(svg, config)
  if (res.data) return res.data
  return svg
}
