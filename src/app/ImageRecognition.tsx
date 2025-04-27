"use client";

import { useState, useCallback, memo, useEffect, useRef } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import {
  Typography,
  Container,
  Box,
  Stack,
  CircularProgress,
} from "@mui/material";
import { FileRejection, useDropzone } from "react-dropzone";
import { cn } from "@/utils/style";
import Image from "next/image";
import { toast } from "react-toastify";

const maxFiles = 1;
const FILE_LIMITED_SIZE = 2 * 1024 * 1024; // 限制最大为 2MB

const ImageRecognition = memo(function ImageRecognition() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingModel, setLoadingModel] = useState(true);
  const [predictions, setPredictions] = useState<cocoSsd.DetectedObject[]>([]);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const model = useRef<cocoSsd.ObjectDetection>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // const [uploading, setUploading] = useState(false);

  const handleDetect = useCallback(async (file: File) => {
    if (!model.current) {
      return;
    }
    const image = document.createElement("img");
    const src = URL.createObjectURL(file);
    image.src = src;
    setImageSrc(src);
    setIsLoading(true);
    image.onload = async () => {
      const predictions = await model.current!.detect(image);
      setPredictions(predictions);
      setIsLoading(false);
    };
  }, []);

  const onDropAccepted = useCallback(
    async (acceptedFiles: File[]) => {
      if (maxFiles !== acceptedFiles.length) {
        return;
      }

      const file = acceptedFiles[0];

      if (model.current) {
        handleDetect(file);
      } else {
        setImageSrc(URL.createObjectURL(file));
        setPendingFile(file);
      }
    },
    [handleDetect]
  );

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      toast(fileRejections[0].errors[0]?.message || "上传失败", {
        type: "error",
      });
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"], // .jpg, .jpeg
      "image/png": [".png"], // .png
      "image/gif": [".gif"], // .gif
      "image/bmp": [".bmp"], // .bmp
      "image/webp": [".webp"], // .webp
    },
    maxSize: FILE_LIMITED_SIZE,
    noClick: isLoading,
    noDrag: isLoading,
    disabled: isLoading,
    onDropAccepted,
    onDropRejected,
  });

  useEffect(() => {
    const loadModel = async () => {
      model.current = await cocoSsd.load();
      setLoadingModel(false);
    };
    loadModel();
  }, []);

  // 处理缓存图片（只处理最后一张）
  useEffect(() => {
    if (!loadingModel && pendingFile) {
      setPendingFile(null);
      handleDetect(pendingFile);
    }
  }, [loadingModel, pendingFile, handleDetect]);

  return (
    <Container maxWidth="md" className="py-4">
      <Typography variant="h4" textAlign="center">
        图片识别
      </Typography>

      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer border-dashed border-2 border-gray-300 rounded-lg px-4 py-8 text-center mt-4",
          "hover:border-gray-400 transition-colors duration-300 ease-in-out"
        )}
      >
        <input {...getInputProps()} />

        <Stack
          direction="row"
          width="100%"
          height={200}
          justifyContent="center"
          alignItems="center"
          className="relative"
        >
          {!imageSrc ? (
            <p className="text-gray-500">
              Drag & drop an image here, or click to select one
            </p>
          ) : (
            <Image
              src={imageSrc}
              alt="pic"
              fill
              className="rounded-lg object-contain"
            />
          )}
        </Stack>
      </div>

      <Box textAlign="center" marginTop={4}>
        <Box marginTop={2}>
          <Typography variant="body1">
            class: {predictions[0]?.class || "-"}
          </Typography>
          <Typography variant="body1">
            score: {predictions[0]?.score || "-"}
          </Typography>
        </Box>

        {loadingModel ||
          (isLoading && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="center"
              mt={2}
            >
              <CircularProgress size={20} />
              <Typography variant="body2">
                {loadingModel
                  ? "模型加载中"
                  : isLoading
                  ? "识别中"
                  : "识别完成"}
              </Typography>
            </Stack>
          ))}
      </Box>
    </Container>
  );
});

export default ImageRecognition;
