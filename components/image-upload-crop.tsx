"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { FiUpload, FiX, FiCheck, FiRotateCw } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ImageUploadCropProps {
  value?: string | null;
  onChange: (imageData: string) => void;
  aspectRatio?: number;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageUploadCrop({ value, onChange, aspectRatio = 4 / 3 }: ImageUploadCropProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setIsCropping(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CropArea,
    rotation = 0
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    
    // Create a temporary canvas for rotation
    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
    
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = safeArea;
    tempCanvas.height = safeArea;
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) {
      throw new Error("No 2d context");
    }

    // Fill with white background to avoid black borders
    tempCtx.fillStyle = "#FFFFFF";
    tempCtx.fillRect(0, 0, safeArea, safeArea);

    // Apply rotation and draw image
    tempCtx.translate(safeArea / 2, safeArea / 2);
    tempCtx.rotate((rotation * Math.PI) / 180);
    tempCtx.translate(-safeArea / 2, -safeArea / 2);

    tempCtx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    // Create final canvas with crop dimensions
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = pixelCrop.width;
    finalCanvas.height = pixelCrop.height;
    const finalCtx = finalCanvas.getContext("2d");

    if (!finalCtx) {
      throw new Error("No 2d context");
    }

    // Fill with white background
    finalCtx.fillStyle = "#FFFFFF";
    finalCtx.fillRect(0, 0, pixelCrop.width, pixelCrop.height);

    // Calculate source coordinates in the rotated canvas
    const sourceX = safeArea / 2 - image.width * 0.5 + pixelCrop.x;
    const sourceY = safeArea / 2 - image.height * 0.5 + pixelCrop.y;

    // Draw the cropped portion from temp canvas to final canvas
    finalCtx.drawImage(
      tempCanvas,
      sourceX,
      sourceY,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // 限制最大尺寸为 1200px，保持宽高比
    const MAX_WIDTH = 1200;
    const MAX_HEIGHT = 1200;
    let finalWidth = pixelCrop.width;
    let finalHeight = pixelCrop.height;

    if (finalWidth > MAX_WIDTH || finalHeight > MAX_HEIGHT) {
      const ratio = Math.min(MAX_WIDTH / finalWidth, MAX_HEIGHT / finalHeight);
      finalWidth = Math.round(finalWidth * ratio);
      finalHeight = Math.round(finalHeight * ratio);

      const resizeCanvas = document.createElement("canvas");
      resizeCanvas.width = finalWidth;
      resizeCanvas.height = finalHeight;
      const resizeCtx = resizeCanvas.getContext("2d");
      
      if (resizeCtx) {
        // Fill with white background
        resizeCtx.fillStyle = "#FFFFFF";
        resizeCtx.fillRect(0, 0, finalWidth, finalHeight);
        resizeCtx.drawImage(finalCanvas, 0, 0, finalWidth, finalHeight);
        return resizeCanvas.toDataURL("image/jpeg", 0.85);
      }
    }

    return finalCanvas.toDataURL("image/jpeg", 0.85);
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      
      // 检查最终图片大小（Base64字符串长度）
      const sizeInBytes = (croppedImage.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      console.log(`Final image size: ${sizeInMB.toFixed(2)} MB`);
      
      // 如果超过800KB，警告用户
      if (sizeInMB > 0.8) {
        const confirmed = confirm(
          `The image size is ${sizeInMB.toFixed(2)} MB. This might cause upload issues. ` +
          `Consider cropping to a smaller area or using a smaller original image. Continue anyway?`
        );
        if (!confirmed) {
          return;
        }
      }
      
      onChange(croppedImage);
      setIsCropping(false);
      setImageSrc(null);
    } catch (e) {
      console.error("Error cropping image:", e);
      alert("Failed to crop image");
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
      />

      {!isCropping && (
        <div>
          {value ? (
            <div className="space-y-3">
              <div className="relative h-64 w-full rounded-lg overflow-hidden border-2 border-border">
                <Image
                  src={value}
                  alt="Uploaded image"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-outline flex-1 flex items-center justify-center gap-2"
                >
                  <FiUpload className="h-4 w-4" />
                  Change Image
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="btn-outline text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <FiX className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
            >
              <FiUpload className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                Click to upload plant image
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG • Recommended: under 2MB
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Large images will be automatically resized
              </p>
            </label>
          )}
        </div>
      )}

      <AnimatePresence>
        {isCropping && imageSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-semibold">Crop Image</h3>
                <button
                  onClick={handleCropCancel}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="relative flex-1 min-h-[400px] bg-muted/30">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspectRatio}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="p-4 border-t border-border space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center justify-between">
                    <span>Zoom</span>
                    <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center justify-between">
                    <span>Rotation</span>
                    <span className="text-xs text-muted-foreground">{rotation}°</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={1}
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setRotation(0)}
                      className="btn-outline p-2"
                      title="Reset rotation"
                    >
                      <FiRotateCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCropCancel}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCropConfirm}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <FiCheck className="h-4 w-4" />
                    Apply Crop
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

