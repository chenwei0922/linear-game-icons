# @yoroll/rn-icon

> Linear Game 图标库 — React Native 版本

基于 `react-native-svg`，提供 190+ 精心设计的图标组件，支持动态颜色、尺寸和 Tree Shaking。

## 安装

```bash
npm install @yoroll/rn-icon react-native-svg
# 或
pnpm add @yoroll/rn-icon react-native-svg
```

**Expo 项目：**

```bash
npx expo install react-native-svg
pnpm add @yoroll/rn-icon
```

## 使用

```tsx
import { IconAdd, IconClose, IconPlay } from '@yoroll/rn-icon'

export default function App() {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <IconAdd size={24} color="#333" />
      <IconClose size={24} color="red" />
      <IconPlay size={32} color="#1890ff" />
    </View>
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
| `style` | `ViewStyle` | - | RN 样式对象 |

## 类型支持

```tsx
import type { IconProps, LGIconType } from '@yoroll/rn-icon'

// 动态图标组件
const MyIcon: LGIconType = IconAdd
```

## 相关

- [`@yoroll/react-icon`](https://www.npmjs.com/package/@yoroll/react-icon) — React / Next.js 版本
- [图标预览](https://LinearGameAI.github.io/linear-game-icons/)

## License

ISC
