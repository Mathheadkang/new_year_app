"use client";

import { useState } from "react";
import { Couplet } from "@/lib/types";

interface ShareButtonProps {
  couplet: Couplet;
}

const RED = "#CC0000";
const DARK_RED = "#7f1d1d";
const GOLD = "#F6C445";
const GOLD_BORDER = "#D4A017";
const WATERMARK_COLOR = "rgba(255, 255, 255, 0.7)";

const QR_CODE_PATH = "/qrcode_305377322_e73f938c6a43205c379437b46b766cc6.png";

// Load image as a Promise
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function drawCoupletToCanvas(couplet: Couplet): Promise<HTMLCanvasElement> {
  const scale = 2;
  const canvasW = 600 * scale;
  const canvasH = 780 * scale; // Increased height for watermark and QR code

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = DARK_RED;
  ctx.fillRect(0, 0, canvasW, canvasH);

  const font = "'STKaiti', 'KaiTi', 'SimSun', 'Songti SC', serif";

  // --- 横批 (horizontal scroll, top center) ---
  const hbW = 360 * scale;
  const hbH = 60 * scale;
  const hbX = (canvasW - hbW) / 2;
  const hbY = 30 * scale;

  // Red panel with gold border
  ctx.strokeStyle = GOLD_BORDER;
  ctx.lineWidth = 4 * scale;
  ctx.fillStyle = RED;
  ctx.fillRect(hbX, hbY, hbW, hbH);
  ctx.strokeRect(hbX, hbY, hbW, hbH);

  // Horizontal text
  ctx.fillStyle = GOLD;
  ctx.font = `bold ${32 * scale}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const hChars = couplet.horizontal.split("");
  const hSpacing = hbW / (hChars.length + 1);
  hChars.forEach((ch, i) => {
    ctx.fillText(ch, hbX + hSpacing * (i + 1), hbY + hbH / 2);
  });

  // --- Vertical scrolls ---
  const scrollW = 80 * scale;
  const charSize = 36 * scale;
  const upperChars = couplet.upper.split("");
  const lowerChars = couplet.lower.split("");
  const maxChars = Math.max(upperChars.length, lowerChars.length);
  const charSpacing = 52 * scale;
  const scrollH = maxChars * charSpacing + 40 * scale;
  const scrollY = hbY + hbH + 30 * scale;

  const gap = 60 * scale;
  const totalScrollsW = scrollW * 2 + gap;
  const scrollStartX = (canvasW - totalScrollsW) / 2;

  // Draw a single vertical scroll
  const drawScroll = (x: number, chars: string[]) => {
    ctx.fillStyle = RED;
    ctx.fillRect(x, scrollY, scrollW, scrollH);
    ctx.strokeStyle = GOLD_BORDER;
    ctx.lineWidth = 4 * scale;
    ctx.strokeRect(x, scrollY, scrollW, scrollH);

    // Inner border
    const inset = 6 * scale;
    ctx.strokeStyle = GOLD_BORDER;
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(x + inset, scrollY + inset, scrollW - inset * 2, scrollH - inset * 2);

    ctx.fillStyle = GOLD;
    ctx.font = `bold ${charSize}px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const startY = scrollY + 30 * scale;
    chars.forEach((ch, i) => {
      ctx.fillText(ch, x + scrollW / 2, startY + i * charSpacing + charSpacing / 2);
    });
  };

  // Upper couplet on the right, lower on the left (traditional order)
  drawScroll(scrollStartX + scrollW + gap, upperChars);
  drawScroll(scrollStartX, lowerChars);

  // --- Watermark text (below couplets, center) ---
  const watermarkY = scrollY + scrollH + 100 * scale;
  ctx.fillStyle = WATERMARK_COLOR;
  ctx.font = `${16 * scale}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("由春联生成器生成", canvasW / 2, watermarkY);

  // --- QR Code (bottom right) ---
  try {
    const qrImg = await loadImage(QR_CODE_PATH);
    const qrSize = 120 * scale; // 80px as requested
    const qrX = canvasW - qrSize - 20 * scale; // 20px padding from right
    const qrY = canvasH - qrSize - 20 * scale; // 20px padding from bottom
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch (err) {
    console.error("Failed to load QR code:", err);
    // Continue without QR code if loading fails
  }

  return canvas;
}

export default function ShareButton({ couplet }: ShareButtonProps) {
  const [showShareTip, setShowShareTip] = useState(false);

  const generateCanvas = async () => {
    return await drawCoupletToCanvas(couplet);
  };

  const handleSave = async () => {
    try {
      const canvas = await generateCanvas();
      const dataUrl = canvas.toDataURL("image/png");

      // Fallback: download
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
      const canvas = await generateCanvas();
      const dataUrl = canvas.toDataURL("image/png");

      // Try native share on mobile
      if (navigator.share && navigator.canShare) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], "spring-couplet.png", {
            type: "image/png",
          });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: "我的春联",
              text: "快来生成你的专属春联吧！",
              files: [file]
            });
            return;
          }
        } catch {
          // Fall through to show tip
        }
      }

      // Show share tip for platforms without native share
      setShowShareTip(true);

      // Also download the image
      const link = document.createElement("a");
      link.download = "spring-couplet.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Share failed:", err);
      alert("分享失败，请重试");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-amber-100 font-medium transition-colors shadow"
        >
          保存图片
        </button>
        <button
          onClick={handleShare}
          className="px-6 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-amber-100 font-medium transition-colors shadow flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
  );
}
