import type { NextConfig } from "next";
import withPWA, { PWAConfig } from "next-pwa";

// const isVercel = !!process.env.VERCEL; // Vercel 平台会自动注入
const isGitHubPages = process.env.DEPLOY_ENV === "GH_PAGES"; // 我们在 Action 里设置
console.log("🚀 ~ isGitHubPages:", isGitHubPages);

// 如果是 GH_PAGES，则给出静态导出相关配置
const staticExportConfig: Partial<NextConfig> = isGitHubPages
  ? {
      output: "export",
      trailingSlash: true,
      basePath: "/FrameAI",
      assetPrefix: "/FrameAI/",
    }
  : {};

// 1. 定义 PWA 插件的配置
const pwaOptions: PWAConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "my-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
  ],
};

// 2. 调用 withPWA 拿到 HOC
const withPWAConfig = withPWA(pwaOptions);

// 3. 定义纯 Next.js 配置
const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  ...staticExportConfig,
};

// 4. 导出最终配置
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default withPWAConfig(nextConfig);
