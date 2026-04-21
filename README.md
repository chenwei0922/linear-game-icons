
# Linear Game Icons

> Linear Game 图标库，支持 React 和 React Native 两个平台。

📖 [在线预览](https://LinearGameAI.github.io/linear-game-icons/)

## 📦 Packages

| Package | Platform | Version |
|---------|----------|---------|
| `@yoroll/react-icon` | React / Next.js | [![npm](https://img.shields.io/npm/v/@yoroll/react-icon)](https://www.npmjs.com/package/@yoroll/react-icon) |
| `@yoroll/rn-icon` | React Native | [![npm](https://img.shields.io/npm/v/@yoroll/rn-icon)](https://www.npmjs.com/package/@yoroll/rn-icon) |

---

## React 接入

### 安装

```bash
npm install @yoroll/react-icon
# 或
pnpm add @yoroll/react-icon
```

### 使用

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

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | - | 同时设置 width 和 height |
| `width` | `number` | - | 单独设置宽度（优先于 size） |
| `height` | `number` | - | 单独设置高度（优先于 size） |
| `color` | `string` | `currentColor` | 图标颜色 |
| `fill` | `string` | - | 填充色（优先于 color） |
| `stroke` | `string` | - | 描边色（优先于 color） |
| `className` | `string` | - | CSS class |

### 类型支持

```tsx
import type { IconProps, LGIconType } from '@yoroll/react-icon'

// 用于动态渲染图标
const MyIcon: LGIconType = IconAdd
```

---

## React Native 接入

### 安装

```bash
npm install @yoroll/rn-icon react-native-svg
# 或
pnpm add @yoroll/rn-icon react-native-svg
```

> ⚠️ `react-native-svg` 是必须的 peer dependency。Expo 项目推荐使用 `npx expo install react-native-svg` 安装兼容版本。

### 使用

```tsx
import { IconAdd, IconClose, IconPlay } from '@yoroll/rn-icon'

function App() {
  return (
    <View>
      <IconAdd size={24} color="#333" />
      <IconClose size={24} color="red" />
      <IconPlay size={32} color="#1890ff" />
    </View>
  )
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | - | 同时设置 width 和 height |
| `width` | `number` | - | 单独设置宽度（优先于 size） |
| `height` | `number` | - | 单独设置高度（优先于 size） |
| `color` | `string` | `currentColor` | 图标颜色 |
| `fill` | `string` | - | 填充色（优先于 color） |
| `stroke` | `string` | - | 描边色（优先于 color） |
| `style` | `ViewStyle` | - | RN 样式对象 |

### 类型支持

```tsx
import type { IconProps, LGIconType } from '@yoroll/rn-icon'
```

---

## 🛠️ 开发

### 项目结构

```
linear-game-icons/
├── packages/
│   ├── react/          # @yoroll/react-icon
│   ├── rn/             # @yoroll/rn-icon
│   └── svg/            # SVG 源文件
├── example/
│   ├── react-next-demo/ # React 预览 (Next.js)
│   └── rn-expo-demo/    # RN 预览 (Expo)
└── sh/                  # 共享脚本（sync, svgo, path...）
```

### 常用命令

```bash
# 从 Figma 同步 SVG
pnpm run sync-icon

# 构建 React 图标库
pnpm run build:react

# 构建 RN 图标库
pnpm run build:rn

# 预览 React 图标
pnpm run preview:react

# 预览 RN 图标 (Expo Web)
pnpm run preview:rn

# 发布 React 包到 npm
pnpm run publish:react

# 发布 RN 包到 npm
pnpm run publish:rn
```

### 新增图标流程

1. 设计师在 Figma 中按约定颜色规范添加图标
   - `#000000` (black) → 对应 `fill` / `color` 动态颜色
   - `#FFFFFF` (white) → 对应 `stroke` / `color` 动态颜色
2. 运行 `pnpm run sync-icon` 从 Figma 拉取最新 SVG
3. 运行 `pnpm run build:react` 和 `pnpm run build:rn` 生成组件
4. 提交代码，CI 自动部署预览页面
5. 运行 `pnpm run publish:react` / `pnpm run publish:rn` 发布新版本