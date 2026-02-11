"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Couplet, FontFamily } from "@/lib/types";
import { drawCoupletToCanvas } from "./ShareButton";

interface PreviewModalProps {
  couplet: Couplet;
  fontFamily: FontFamily;
  backgroundImage: string | null;
  onClose: () => void;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create blob"));
    }, "image/png");
  });
}

export default function PreviewModal({
  couplet,
  fontFamily,
  backgroundImage,
  onClose,
}: PreviewModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background transform state
  const [bgOffsetX, setBgOffsetX] = useState(0);
  const [bgOffsetY, setBgOffsetY] = useState(0);
  const [bgZoom, setBgZoom] = useState(1.5);
  const [showShareTip, setShowShareTip] = useState(false);

  // Drag state
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Pinch state
  const lastPinchDist = useRef(0);

  const redraw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const result = await drawCoupletToCanvas(
      couplet,
      fontFamily,
      backgroundImage,
      { offsetX: bgOffsetX, offsetY: bgOffsetY, zoom: bgZoom }
    );
    const ctx = canvas.getContext("2d")!;
    canvas.width = result.width;
    canvas.height = result.height;
    ctx.drawImage(result, 0, 0);
  }, [couplet, fontFamily, backgroundImage, bgOffsetX, bgOffsetY, bgZoom]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // --- Mouse events (desktop) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!backgroundImage) return;
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !backgroundImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const dx = (e.clientX - lastPos.current.x) * scaleX;
    const dy = (e.clientY - lastPos.current.y) * scaleY;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setBgOffsetX((prev) => prev + dx);
    setBgOffsetY((prev) => prev + dy);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!backgroundImage) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setBgZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // --- Touch events (mobile) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!backgroundImage) return;
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      isDragging.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!backgroundImage) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (e.touches.length === 1 && isDragging.current) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const dx = (e.touches[0].clientX - lastPos.current.x) * scaleX;
      const dy = (e.touches[0].clientY - lastPos.current.y) * scaleY;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setBgOffsetX((prev) => prev + dx);
      setBgOffsetY((prev) => prev + dy);
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastPinchDist.current > 0) {
        const scale = dist / lastPinchDist.current;
        setBgZoom((prev) => Math.max(0.5, Math.min(3, prev * scale)));
      }
      lastPinchDist.current = dist;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    lastPinchDist.current = 0;
  };

  const generateFinalCanvas = async () => {
    return await drawCoupletToCanvas(
      couplet,
      fontFamily,
      backgroundImage,
      { offsetX: bgOffsetX, offsetY: bgOffsetY, zoom: bgZoom }
    );
  };

  const handleSave = async () => {
    try {
      const canvas = await generateFinalCanvas();
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "spring-couplet.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("图片导出失败，请重试");
    }
  };

  const handleShare = async () => {
    try {
      const canvas = await generateFinalCanvas();

      if (navigator.share && navigator.canShare) {
        try {
          const blob = await canvasToBlob(canvas);
          const file = new File([blob], "spring-couplet.png", { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: "我的春联",
              text: "快来生成你的专属春联吧！",
              files: [file],
            });
            return;
          }
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") return;
        }
      }

      // Fallback: download + tip
      setShowShareTip(true);
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "spring-couplet.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Share failed:", err);
      alert("分享失败，请重试");
    }
  };

  const handleReset = () => {
    setBgOffsetX(0);
    setBgOffsetY(0);
    setBgZoom(1.5);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-red-950 rounded-xl border border-amber-700/50 shadow-2xl flex flex-col items-center gap-3 p-4 max-h-[90vh] max-w-[95vw]">
        <p className="text-amber-200 text-sm">
          {backgroundImage ? "拖拽调整背景位置，滚轮/双指缩放" : "预览图片"}
        </p>

        <div
          className="overflow-hidden rounded-lg border border-amber-700/30"
          style={{ cursor: backgroundImage ? "grab" : "default", touchAction: "none" }}
        >
          <canvas
            ref={canvasRef}
            className="max-h-[55vh] max-w-full"
            style={{ width: "auto", height: "auto" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>

        {backgroundImage && (
          <div className="flex items-center gap-3 w-full max-w-xs">
            <span className="text-amber-300/60 text-xs shrink-0">缩放</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={bgZoom}
              onChange={(e) => setBgZoom(parseFloat(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <button
              onClick={handleReset}
              className="text-amber-300/60 text-xs underline shrink-0"
            >
              重置
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-amber-100 font-medium transition-colors shadow"
          >
            返回
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-amber-100 font-medium transition-colors shadow flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
            </svg>
            保存图片
          </button>
          <button
            onClick={handleShare}
            className="px-5 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-amber-100 font-medium transition-colors shadow flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            分享图片
          </button>
        </div>

        {showShareTip && (
          <div className="bg-amber-900/80 text-amber-100 px-4 py-3 rounded-lg text-sm max-w-xs text-center animate-fade-in">
            <p>图片已保存到本地</p>
            <p className="mt-1 text-amber-200/80">请打开微信/小红书，选择图片分享给好友或发布动态</p>
            <button
              onClick={() => setShowShareTip(false)}
              className="mt-2 text-amber-300 underline text-xs"
            >
              知道了
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
