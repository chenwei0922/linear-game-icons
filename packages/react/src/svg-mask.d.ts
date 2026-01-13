// src/types/svg-mask.d.ts (或者放在 src 下任意 .d.ts 文件中)

import 'react';

declare module 'react' {
  // 扩展 SVG 属性接口
  interface SVGProps<T> extends DOMAttributes<T> {
    // 告诉 TS，maskType 是一个合法的 SVG 属性
    maskType?: string;
    // 如果之后遇到 mix-blend-mode 报错，也可以在这里加
    mixBlendMode?: string;
  }
}