import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  output: "standalone",
  // reactStrictMode: true,
  // 其他 Next.js 配置项
};

export default withPWA({
  ...nextConfig,
  dest: "public", // 设置 Service Worker 存放的位置
  register: true, // 自动注册 Service Worker
  skipWaiting: true, // 跳过等待阶段
});
