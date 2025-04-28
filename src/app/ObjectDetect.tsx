"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, CircularProgress, Typography } from "@mui/material";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

// 英文标签到中文标签的映射
const classMap: { [key: string]: string } = {
  person: "人",
  bicycle: "自行车",
  car: "汽车",
  motorcycle: "摩托车",
  airplane: "飞机",
  bus: "公交车",
  train: "火车",
  truck: "卡车",
  boat: "船",
  "traffic light": "交通灯",
  "fire hydrant": "消防栓",
  "stop sign": "停止标志",
  "parking meter": "停车表",
  bench: "长凳",
  bird: "鸟",
  cat: "猫",
  dog: "狗",
  horse: "马",
  sheep: "羊",
  cow: "牛",
  elephant: "大象",
  bear: "熊",
  zebra: "斑马",
  giraffe: "长颈鹿",
  backpack: "背包",
  umbrella: "雨伞",
  handbag: "手提包",
  tie: "领带",
  suitcase: "手提箱",
  frisbee: "飞盘",
  skis: "滑雪板",
  snowboard: "滑雪双杖",
  "sports ball": "滑板",
  kite: "冲浪板",
  "baseball bat": "网球拍",
  bottle: "瓶子",
  "wine glass": "葡萄酒杯",
  cup: "杯子",
  fork: "叉子",
  knife: "刀子",
  spoon: "勺子",
  bowl: "碗",
  banana: "香蕉",
  apple: "苹果",
  sandwich: "三明治",
  orange: "橙子",
  broccoli: "西兰花",
  carrot: "胡萝卜",
  "hot dog": "热狗",
  pizza: "比萨饼",
  donut: "甜甜圈",
  cake: "蛋糕",
  chair: "椅子",
  couch: "沙发",
  "potted plant": "盆栽植物",
  bed: "床",
  "dining table": "餐桌",
  toilet: "厕所",
  tv: "电视",
  laptop: "笔记本电脑",
  mouse: "鼠标",
  remote: "遥控器",
  keyboard: "键盘",
  "cell phone": "手机",
  microwave: "微波炉",
  oven: "烤箱",
  toaster: "烤面包机",
  sink: "水槽",
  refrigerator: "冰箱",
  book: "书",
  clock: "时钟",
  vase: "花瓶",
  scissors: "剪刀",
  "teddy bear": "泰迪熊",
  "hair drier": "吹风机",
  toothbrush: "牙刷",
};

export default function ObjectDetect() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [loading, setLoading] = useState<boolean>(true);

  // 加载模型并提供加载提示
  const loadModel = useCallback(async () => {
    setLoading(true);
    const loadedModel = await cocoSsd.load();
    setModel(loadedModel);
    setLoading(false);
    console.log("模型加载完成");
  }, []);

  // 启动摄像头
  const startCamera = useCallback(async (mode: "user" | "environment") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("启动摄像头失败", error);
    }
  }, []);

  // 停止摄像头
  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, []);

  // 绘制识别框
  const drawPredictions = useCallback(
    (predictions: cocoSsd.DetectedObject[]) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 确保画布的尺寸与视频一致
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      predictions.forEach((prediction) => {
        const [x, y, width, height] = prediction.bbox;

        // 计算物体框的位置和大小
        const left = x * canvas.width;
        const top = y * canvas.height;
        const right = (x + width) * canvas.width;
        const bottom = (y + height) * canvas.height;

        // 获取中文标签，通过 classMap 映射
        const className = classMap[prediction.class] || prediction.class;

        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 2;
        ctx.strokeRect(left, top, right - left, bottom - top); // 绘制框

        ctx.font = "16px Arial";
        ctx.fillStyle = "#00FFFF";
        ctx.fillText(
          `${className} (${(prediction.score * 100).toFixed(1)}%)`,
          left,
          top > 10 ? top - 5 : 10
        );
      });
    },
    []
  );

  useEffect(() => {
    loadModel();
  }, [loadModel]);

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      stopCamera();
    };
  }, [facingMode, startCamera, stopCamera]);

  useEffect(() => {
    if (!model) return;

    let animationId: number;
    let frameCount = 0;

    const detectFrame = async () => {
      if (!videoRef.current) return;

      // 每隔 3-5 帧进行一次识别
      if (frameCount % 3 === 0) {
        const predictions = await model.detect(videoRef.current);
        drawPredictions(predictions);
      }

      frameCount++;
      animationId = requestAnimationFrame(detectFrame);
    };

    detectFrame();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [model, drawPredictions]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4">
      <Button
        variant="contained"
        color="primary"
        onClick={toggleCamera}
        className="!rounded-xl !px-6 !py-3"
      >
        切换摄像头
      </Button>

      <div className="relative w-full max-w-2xl aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-200">
        <video
          ref={videoRef}
          style={{ width: "100%", height: "auto" }}
          muted
          autoPlay
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-xl">
            <div className="flex flex-col items-center">
              <CircularProgress color="primary" size={50} />
              <Typography variant="h6" className="mt-2 text-white">
                模型加载中...
              </Typography>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
