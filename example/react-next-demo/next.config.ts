import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // 关键：启用静态导出
  images: {
    unoptimized: true,
  },
  trailingSlash: false, // 确保 URL 以斜杠结尾
  basePath: process.env.NODE_ENV === 'production' ? '/linear-game-icons' : ''
};

export default nextConfig;
