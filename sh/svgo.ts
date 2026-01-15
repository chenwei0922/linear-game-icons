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
      //将 style 转换为 attrs
      'convertStyleToAttrs',
      //// 移除默认的 width/height，完全依赖 viewBox 和我们注入的 props
      'removeDimensions',
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
            // 填充色，对应fill
            'black': '_fillColor',
            '#000000': '_fillColor',
            '#000': '_fillColor',

            // 线条色，对应stroke
            'white': '_strokeColor',
            '#ffffff': '_strokeColor',
            '#fff': '_strokeColor'
          }
          const deal = (children: XastChild[]) => {
            children.map((n) => {
              const node = n as XastElement
              if (!node.attributes) return;
              // console.log(node.attributes)
              for (const [name, value] of Object.entries(node.attributes)) {
                // 处理颜色 key 值, 如果 color, fill, stroke属性值为以上颜色值，则用占位符替换，否则不做变动
                if (['color', 'fill', 'stroke'].includes(name)) {
                  // 🛑 规则 1: 绝对不碰 url() 引用 (渐变、遮罩、滤镜)
                  if (value.includes('url(')) {
                    continue;
                  }
                  // 🛑 规则 2: 不碰 "none"
                  if (value === 'none') {
                    continue;
                  }
                  // 🎯 规则 3: 精确匹配颜色
                  for (const [color, _placeColorName] of Object.entries(colorRelations)) {
                    // 颜色一致
                    if (tinycolor.equals(value, color)) {
                      node.attributes[name] = `${_placeColorName} || 'currentColor' || '${value}'`
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
              if (!node.attributes) return;

              for (const [name, value] of Object.entries(node.attributes)) {
                // console.log(node.attributes)
                if (Object.keys(attrRelations).includes(name)) {
                  // 🔥 核心修复逻辑在这里 🔥
                  // 如果当前属性是 width 或 height，必须检查当前节点是不是 'svg' 根标签
                  // 如果是内部元素（如 rect, g, mask），绝对不要修改它们的尺寸，保持原样！
                  if ((name === 'width' || name === 'height') && node.name !== 'svg') {
                    continue;
                  }
                  // 如果已经包含占位符（说明被前面的插件处理过了），跳过
                  if (value.includes(attrRelations[name])) {
                    continue;
                  }

                  if (name === 'class') {
                    node.attributes[name] = `'${value} ' + ${attrRelations[name]} `
                  } else {
                    node.attributes[name] = `${attrRelations[name]} || ${value}`
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
      name: 'fixStyleAndCamelCase',
      fn: (root: XastRoot) => {
        const visit = (node: XastElement) => {
          // 1. 处理残留的 style 属性 (专门解决 mask-type 报错)
          if (node.attributes && node.attributes.style) {
            const styleStr = node.attributes.style;
            // 分割样式字符串 "mask-type:luminance; color:red"
            const styles = styleStr.split(';');

            styles.forEach((s) => {
              const [key, val] = s.split(':');
              if (key && val) {
                // key: "mask-type" -> camelKey: "maskType"
                const camelKey = camelcase(key.trim());
                // 把它提出来变成属性
                node.attributes[camelKey] = val.trim();
              }
            });
            // 💀 核心步骤：彻底删除 style 属性，消除 TS 报错
            delete node.attributes.style;
          }

          // 2. 处理原本就是属性但带横杠的 key (如 stroke-width -> strokeWidth)
          // 必须放在处理 style 之后，因为 style 里的属性提出来可能也带横杠
          if (node.attributes) {
            for (const [name, value] of Object.entries(node.attributes)) {
              if (name.includes('-')) {
                const camelKey = camelcase(name);
                // 只有当新名字和旧名字不一样时才替换，防止无限循环
                if (camelKey !== name) {
                  node.attributes[camelKey] = value;
                  delete node.attributes[name];
                }
              }
            }
          }

          // 递归处理子节点
          if (node.children) {
            node.children.forEach((child) => {
              if (child.type === 'element') {
                visit(child);
              }
            });
          }
        };

        if (root.children) {
          root.children.forEach((child) => {
            if (child.type === 'element') {
              visit(child);
            }
          });
        }
        return null;
      }
    })
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
