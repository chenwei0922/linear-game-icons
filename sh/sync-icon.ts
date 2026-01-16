import path from "path";
import { pathSvg } from "./path";
import chalk from "chalk";
import axios from "axios";
import { emptyDir, ensureDir, existsSync, readdir, readJson, remove, statSync, writeFile, writeJSON } from "fs-extra";
import dotenv from "dotenv";
dotenv.config()

const FIGMA_TOKEN = process.env.FIGMA_TOKEN
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY
const ICON_PAGE_NAME = 'icon'
const OUTPUT_DIR = pathSvg

if (!FIGMA_TOKEN || !FIGMA_FILE_KEY) {
  console.error(chalk.red('❌ 缺少环境变量: 请检查 FIGMA_TOKEN 和 FIGMA_FILE_KEY'));
  process.exit(1);
}

// https://api.figma.com/v1{file_key}/
const api = axios.create({
  baseURL: 'https://api.figma.com/v1',
  headers: { 'X-Figma-Token': FIGMA_TOKEN },
});

const normalizeName = (name: string) => {
  return name
    .trim()
    .replace(/\//g, '-')   // 斜杠转中划线
    .replace(/s+/g, '-')   // 空格转中划线
    .replace(/[^a-zA-Z0-9-_]/g, '') // 移除非法字符
    .replace(/-+/g, '-')   // 移除重复中划线
    .toLowerCase();
};

const getFileData = async () => {
  let fileData;
  // 缓存文件的路径
  const CACHE_PATH = path.resolve(process.cwd(), 'figma-cache.json');
  // 设置缓存过期时间 (例如 1 小时)，开发时可以设长一点
  const CACHE_DURATION = 8 * 60 * 60 * 1000;
  // === 1. 智能获取文件结构 (带缓存) ===
  let useCache = false;

  // 检查缓存是否存在且未过期
  if (existsSync(CACHE_PATH)) {
    const stats = statSync(CACHE_PATH);
    const now = new Date().getTime();
    if (now - stats.mtimeMs < CACHE_DURATION) {
      useCache = true;
    }
  }
  // useCache = false //远端的话，每次都要请求，不使用缓存了，因为远端一天一执行
  if (useCache) {
    console.log(chalk.yellow('📦 命中本地缓存 (figma-cache.json)，跳过 API 请求...'));
    fileData = await readJson(CACHE_PATH); // 读取本地文件
  } else {
    console.log(chalk.gray(`📡 缓存失效或不存在，请求 Figma API: ${FIGMA_FILE_KEY}...`));
    const { data } = await api.get(`/files/${FIGMA_FILE_KEY}`);
    fileData = data;

    // 写入缓存，供下次调试用
    console.log(chalk.gray(`💾 正在写入本地缓存...`));
    await writeJSON(CACHE_PATH, data);
  }
  return fileData
}

async function main() {
  console.log(chalk.blue(`🔄 开始同步 Figma 图标...`));
  try {
    // 1. 获取文件节点结构
    const fileData = await getFileData()
    //2. 找到目标Page
    const document = fileData.document;
    const canvas = document.children.find((c: { name: string; }) => c.name === ICON_PAGE_NAME);
    if (!canvas) {
      throw new Error(`找不到名为 "${ICON_PAGE_NAME}" 的 Page，请检查 Figma 文件`);
    }

    // 如果是 Variants (COMPONENT_SET)，需要进一步提取里面的子组件，这里简化处理，只取 COMPONENT
    // 实际项目中建议图标不要做成复杂 Variants，每个图标一个 Component 最好
    const targetNodes: { id: string; name: string; type: string; children: any; }[] = [];
    const traverse = (nodes: any[]) => {
      nodes.forEach((node: any) => {
        //1. 命中目标：如果是组件，收集起来,同时匹配 COMPONENT (母版) 和 INSTANCE (实例)
        if (node.type === 'COMPONENT' || node.type === 'INSTANCE' || node.type === 'FRAME') {
          targetNodes.push(node)
          return
        }
        //2. 特殊情况：如果是组件集 (Variants)，通常里面的子节点才是真正的图标 SVG
        // 例如：一个 "Icon" 组件集，里面有 "Home", "User" 等变体
        if (node.type === 'COMPONENT_SET') {
          traverse(node.children)
          return
        }

        // 3. 继续下钻：如果是容器 (FRAME, GROUP, SECTION, INSTANCE 等)，且有 children，就继续递归
        // 注意：API 返回的 node 只要有 children 属性，就代表它里面还有东西
        if (node.children) {
          traverse(node.children)
        }
      })
    };
    traverse(canvas.children); // 递归查找所有组件

    console.log(chalk.green(`✅ 发现 ${targetNodes.length} 个图标节点`));

    if (targetNodes.length === 0) return;
    // process.exit(0)


    // 4. 获取下载链接 (批量)
    const ids = targetNodes.map(n => n.id).join(',');
    const { data: imageData } = await api.get(`/images/${FIGMA_FILE_KEY}`, {
      params: { ids, format: 'svg' },
    });
    const urlMap = imageData.images;

    // 5. 准备目录
    await ensureDir(OUTPUT_DIR);

    // 清理旧的 SVG 文件，但保留其他文件（如 package.json）
    const existingFiles = await readdir(OUTPUT_DIR);
    for (const file of existingFiles) {
      if (file.endsWith('.svg')) {
        await remove(path.join(OUTPUT_DIR, file));
      }
    }

    // 6. 下载并处理
    for (const node of targetNodes) {
      const url = urlMap[node.id];
      if (!url) {
        console.warn(`❌ 找不到 ${node.name} 的下载链接`);
        continue;
      }
      const svgContent = await axios.get(url, { responseType: 'text' }); //改成fetch
      const svgPath = path.join(OUTPUT_DIR, `${node.name}.svg`);
      await writeFile(svgPath, svgContent.data);
      console.log(`✅ 下载 ${node.name} 到 ${svgPath}`);
    }
    console.log(chalk.green(`✅ 完成同步 ${targetNodes.length} 个图标`));
  } catch (error) {
    console.error(chalk.red(`❌ 同步失败: ${(error as Error).message}`));
    process.exit(1);
  }
}

main()
