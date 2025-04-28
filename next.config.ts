import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true, // 可选：开启严格模式以帮助开发
  trailingSlash: true, // 配置 Next.js 输出的路径末尾是否加上斜杠
  // 其他 Next.js 配置项
};

export default withPWA({
  ...nextConfig,
  dest: "public", // 设置 Service Worker 存放的位置
  register: true, // 自动注册 Service Worker
  skipWaiting: true, // 跳过等待阶段
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "my-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 1 天的缓存
        },
      },
    },
  ],
});
