import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FrameAI",
  description:
    "运行于浏览器端的实时目标检测应用，能够在不依赖服务器推理的情况下，直接使用摄像头视频流进行物体识别与分类。通过 TensorFlow.js 加载预训练的 Coco-SSD 模型，结合 WebGL/WASM 后端优化，实现高效的前端 AI 推理体验。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        <ToastContainer />
      </body>
    </html>
  );
}
