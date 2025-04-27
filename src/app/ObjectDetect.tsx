"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export default function ObjectDetect() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  const loadModel = useCallback(async () => {
    const loadedModel = await cocoSsd.load();
    setModel(loadedModel);
    console.log("模型加载完成");
  }, []);

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

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, []);

  const drawPredictions = useCallback(
    (predictions: cocoSsd.DetectedObject[]) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 动态设置 canvas 尺寸和视频同步
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      predictions.forEach((prediction) => {
        const [x, y, width, height] = prediction.bbox;

        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        ctx.font = "16px Arial";
        ctx.fillStyle = "#00FFFF";
        ctx.fillText(
          `${prediction.class} (${(prediction.score * 100).toFixed(1)}%)`,
          x,
          y > 10 ? y - 5 : 10
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

    const detectFrame = async () => {
      if (!videoRef.current) return;
      const predictions = await model.detect(videoRef.current);
      drawPredictions(predictions);
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
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <button
          onClick={toggleCamera}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            background: "#0070f3",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          切换摄像头
        </button>
      </div>
      <div style={{ position: "relative" }}>
        <video
          ref={videoRef}
          style={{ width: "100%", height: "auto" }}
          muted
          autoPlay
          playsInline
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </div>
  );
}
