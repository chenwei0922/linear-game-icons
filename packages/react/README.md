# @yoroll/react-icon

> Linear Game 图标库 — React 版本

提供 190+ 精心设计的 SVG 图标组件，支持动态颜色、尺寸和 Tree Shaking。

## 安装

```bash
npm install @yoroll/react-icon
# 或
pnpm add @yoroll/react-icon
```

## 使用

```tsx
import { IconAdd, IconClose, IconPlay } from '@yoroll/react-icon'

function App() {
  return (
    <div>
      <IconAdd size={24} color="#333" />
      <IconClose size={24} color="red" />
      <IconPlay size={32} color="#1890ff" />
    </div>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | - | 同时设置 width 和 height |
| `width` | `number` | - | 宽度（优先于 size） |
| `height` | `number` | - | 高度（优先于 size） |
| `color` | `string` | `currentColor` | 图标颜色 |
| `fill` | `string` | - | 填充色（优先于 color） |
| `stroke` | `string` | - | 描边色（优先于 color） |
| `className` | `string` | - | CSS class |

## 类型支持

```tsx
import type { IconProps, LGIconType } from '@yoroll/react-icon'

// 动态图标组件
const MyIcon: LGIconType = IconAdd
```

## 相关

- [`@yoroll/rn-icon`](https://www.npmjs.com/package/@yoroll/rn-icon) — React Native 版本
- [图标预览](https://LinearGameAI.github.io/linear-game-icons/)

## License

ISC
