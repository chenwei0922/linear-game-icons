import camelcase from 'camelcase'
import { Config, optimize, PluginInfo, XastChild, XastElement, XastRoot } from 'svgo'
import tinycolor from 'tinycolor2'

const getSvgoConfig = (lang: 'react' | 'vue' | 'rn' = 'react') => {
  const _placeClass = (lang === 'react' || lang === 'rn') ? '_className' : '_class'

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

      // 自定义插件 => 移除 Figma 导出的无效属性
      // 1. data-figma-* 属性在 React 中不是有效的 SVG 属性
      // 2. xmlns 属性在非 SVG 元素上（如 foreignObject 内的 div）不合法
      {
        name: 'removeFigmaDataAttrs',
        fn: (root: XastRoot) => {
          const visit = (node: XastElement) => {
            if (node.attributes) {
              // 移除 data-figma-* 属性
              for (const name of Object.keys(node.attributes)) {
                if (name.startsWith('data-figma')) {
                  delete node.attributes[name];
                }
              }
              // 移除非 SVG 元素上的 xmlns 属性（如 foreignObject 内的 div）
              if (node.name !== 'svg' && node.attributes.xmlns) {
                delete node.attributes.xmlns;
              }
            }
            if (node.children) {
              node.children.forEach((child) => {
                if (child.type === 'element') {
                  visit(child);
                }
              });
            }
          };
          root.children.forEach((child) => {
            if (child.type === 'element') {
              visit(child);
            }
          });
          return null;
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
  if (lang === 'react' || lang === 'rn') {
    svgoConfig.plugins?.push({
      name: 'fixStyleAndCamelCase',
      fn: (root: XastRoot) => {
        const visit = (node: XastElement) => {
          // 1. 处理残留的 style 属性，转换为 React 对象语法
          // 例如: style="background:red; height:100%" => style={{ background: 'red', height: '100%' }}
          if (node.attributes && node.attributes.style) {
            const styleStr = node.attributes.style;
            // 分割样式字符串 "mask-type:luminance; color:red"
            const styles = styleStr.split(';').map(s => s.trim()).filter(s => s);

            // 用于存储转换后的样式对象属性
            const styleObjectParts: string[] = [];

            styles.forEach((s) => {
              const colonIndex = s.indexOf(':');
              if (colonIndex === -1) return;

              const key = s.substring(0, colonIndex).trim();
              const val = s.substring(colonIndex + 1).trim();

              // 将 CSS 属性名转换为 camelCase (如 background-color -> backgroundColor, mask-type -> maskType)
              const camelKey = camelcase(key);
              // 判断值是否为纯数字（如 opacity: 1）
              const isNumeric = /^-?\d+(\.\d+)?$/.test(val);
              if (isNumeric) {
                styleObjectParts.push(`${camelKey}: ${val}`);
              } else {
                // 字符串值需要用引号包裹
                styleObjectParts.push(`${camelKey}: '${val}'`);
              }
            });

            // 如果有样式，转换为 React 对象语法；否则删除
            if (styleObjectParts.length > 0) {
              // 生成 {{ key: 'value', key2: 'value2' }} 格式
              node.attributes.style = `{{ ${styleObjectParts.join(', ')} }}`;
            } else {
              delete node.attributes.style;
            }
          }

          // 1.5 处理独立的 opacity 属性（非 SVG 元素上），合并到 style 中
          // 注意：SVG 元素上的 opacity 是有效的，但 foreignObject 内部的 div 等元素上的 opacity 应该在 style 中
          if (node.attributes && node.attributes.opacity && node.name !== 'svg') {
            const opacityVal = node.attributes.opacity;
            if (node.attributes.style) {
              // 如果已有 style ({{ ... }} 格式)，在末尾追加 opacity
              node.attributes.style = node.attributes.style.replace(/\s*\}\}$/, `, opacity: ${opacityVal} }}`);
            } else {
              // 如果没有 style，创建新的
              node.attributes.style = `{{ opacity: ${opacityVal} }}`;
            }
            delete node.attributes.opacity;
          }

          // 2. 处理原本就是属性但带横杠或冒号的 key
          // 如 stroke-width -> strokeWidth, xlink:href -> xlinkHref, xmlns:xlink -> xmlnsXlink
          if (node.attributes) {
            // 特殊处理 XML 命名空间属性的映射
            const namespaceAttrMap: Record<string, string> = {
              'xmlns:xlink': 'xmlnsXlink',
              'xlink:href': 'xlinkHref',
              'xml:space': 'xmlSpace',
              'xml:lang': 'xmlLang',
            };

            for (const [name, value] of Object.entries(node.attributes)) {
              // 先检查是否是命名空间属性
              if (namespaceAttrMap[name]) {
                node.attributes[namespaceAttrMap[name]] = value;
                delete node.attributes[name];
              } else if (name.includes('-')) {
              // 处理带横杠的属性
                const camelKey = camelcase(name);
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

export const optimizeSvg = ({ svg, lang = 'react' }: { svg: string; lang?: 'react' | 'vue' | 'rn' }) => {
  const config = getSvgoConfig(lang)
  const res = optimize(svg, config)
  if (res.data) return res.data
  return svg
}
