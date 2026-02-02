"use client";

import { Couplet } from "@/lib/types";

interface ShareButtonProps {
  couplet: Couplet;
}

const RED = "#CC0000";
const DARK_RED = "#7f1d1d";
const GOLD = "#F6C445";
const GOLD_BORDER = "#D4A017";

function drawCoupletToCanvas(couplet: Couplet): HTMLCanvasElement {
  const scale = 2;
  const canvasW = 600 * scale;
  const canvasH = 700 * scale;

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

  return canvas;
}

export default function ShareButton({ couplet }: ShareButtonProps) {
  const handleExport = async () => {
    try {
      const canvas = drawCoupletToCanvas(couplet);
      const dataUrl = canvas.toDataURL("image/png");

      // Try native share on mobile
      if (navigator.share && navigator.canShare) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], "spring-couplet.png", {
            type: "image/png",
          });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ title: "我的春联", files: [file] });
            return;
          }
        } catch {
          // Fall through to download
        }
      }

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

  return (
    <button
      onClick={handleExport}
      className="px-6 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-amber-100 font-medium transition-colors shadow"
    >
      保存图片
    </button>
  );
}
