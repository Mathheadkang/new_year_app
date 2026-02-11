"use client";

import { useState } from "react";
import { Couplet, FontFamily } from "@/lib/types";
import PreviewModal from "./PreviewModal";

interface ShareButtonProps {
  couplet: Couplet;
  fontFamily?: FontFamily;
  backgroundImage?: string | null;
}

const RED = "#CC0000";
const DARK_RED = "#7f1d1d";
const GOLD = "#F6C445";
const GOLD_BORDER = "#D4A017";
const WATERMARK_COLOR = "rgba(255, 255, 255, 0.7)";

const QR_CODE_PATH = "/QR.png";

const canvasFontMap: Record<FontFamily, string> = {
  default: "'STKaiti', 'KaiTi', 'SimSun', 'Songti SC', serif",
  zhengqing: "'ZhengQing', 'STKaiti', 'KaiTi', serif",
  liujianmaocao: "'LiuJianMaoCao', 'STKaiti', 'KaiTi', serif",
  mashanzheng: "'MaShanZheng', 'STKaiti', 'KaiTi', serif",
  zhimangxing: "'ZhiMangXing', 'STKaiti', 'KaiTi', serif",
};

export interface BgTransform {
  offsetX: number;
  offsetY: number;
  zoom: number;
}

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

export async function drawCoupletToCanvas(
  couplet: Couplet,
  fontFamily: FontFamily = "default",
  backgroundImage?: string | null,
  bgTransform?: BgTransform
): Promise<HTMLCanvasElement> {
  const scale = 2;
  const canvasW = 600 * scale;
  const canvasH = 780 * scale;

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d")!;

  // Background
  if (backgroundImage) {
    try {
      const bgImg = await loadImage(backgroundImage);
      const bgZoom = bgTransform?.zoom ?? 1.5;
      const bgOffX = bgTransform?.offsetX ?? 0;
      const bgOffY = bgTransform?.offsetY ?? 0;

      const imgRatio = bgImg.width / bgImg.height;
      const canvasRatio = canvasW / canvasH;
      let drawW: number, drawH: number;
      if (imgRatio > canvasRatio) {
        drawH = canvasH * bgZoom;
        drawW = drawH * imgRatio;
      } else {
        drawW = canvasW * bgZoom;
        drawH = drawW / imgRatio;
      }
      const drawX = (canvasW - drawW) / 2 + bgOffX;
      const drawY = (canvasH - drawH) / 2 + bgOffY;
      ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
    } catch {
      ctx.fillStyle = DARK_RED;
      ctx.fillRect(0, 0, canvasW, canvasH);
    }
  } else {
    ctx.fillStyle = DARK_RED;
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  const font = canvasFontMap[fontFamily];

  // --- 横批 (horizontal scroll, top center) ---
  const hbW = 360 * scale;
  const hbH = 60 * scale;
  const hbX = (canvasW - hbW) / 2;
  const hbY = 30 * scale;

  ctx.strokeStyle = GOLD_BORDER;
  ctx.lineWidth = 4 * scale;
  ctx.fillStyle = RED;
  ctx.fillRect(hbX, hbY, hbW, hbH);
  ctx.strokeRect(hbX, hbY, hbW, hbH);

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

  const drawScroll = (x: number, chars: string[]) => {
    ctx.fillStyle = RED;
    ctx.fillRect(x, scrollY, scrollW, scrollH);
    ctx.strokeStyle = GOLD_BORDER;
    ctx.lineWidth = 4 * scale;
    ctx.strokeRect(x, scrollY, scrollW, scrollH);

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

  drawScroll(scrollStartX + scrollW + gap, upperChars);
  drawScroll(scrollStartX, lowerChars);

  // --- Watermark ---
  const watermarkY = scrollY + scrollH + 100 * scale;
  ctx.fillStyle = WATERMARK_COLOR;
  ctx.font = `${16 * scale}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("由春联生成器生成", canvasW / 2, watermarkY);

  // --- QR Code ---
  try {
    const qrImg = await loadImage(QR_CODE_PATH);
    const qrSize = 120 * scale;
    const qrX = canvasW - qrSize - 20 * scale;
    const qrY = canvasH - qrSize - 20 * scale;
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch (err) {
    console.error("Failed to load QR code:", err);
  }

  return canvas;
}

export default function ShareButton({ couplet, fontFamily = "default", backgroundImage }: ShareButtonProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPreview(true)}
        className="px-6 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-amber-100 font-medium transition-colors shadow flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        编辑图片并保存
      </button>

      {showPreview && (
        <PreviewModal
          couplet={couplet}
          fontFamily={fontFamily}
          backgroundImage={backgroundImage ?? null}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
