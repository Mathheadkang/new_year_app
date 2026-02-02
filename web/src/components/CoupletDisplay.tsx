"use client";

import { Couplet, FontFamily } from "@/lib/types";

interface CoupletDisplayProps {
  couplet: Couplet;
  fontFamily?: FontFamily;
}

const fontFamilyMap: Record<FontFamily, string> = {
  default: "'STKaiti', 'KaiTi', 'SimSun', serif",
  zhengqing: "'ZhengQing', 'STKaiti', 'KaiTi', serif",
  zhenzong: "'ZhenZong', 'STKaiti', 'KaiTi', serif",
  yingzhui: "'YingZhui', 'STKaiti', 'KaiTi', serif",
  yishan: "'YiShan', 'STKaiti', 'KaiTi', serif",
  aoyagi: "'Aoyagi', 'STKaiti', 'KaiTi', serif",
};

export default function CoupletDisplay({ couplet, fontFamily = "default" }: CoupletDisplayProps) {
  const { upper, lower, horizontal } = couplet;
  const fontStyle = fontFamilyMap[fontFamily];

  return (
    <div className="flex flex-col items-center gap-4 py-6 px-4">
      {/* 横批 */}
      <div className="bg-red-700 border-4 border-amber-500 px-8 py-3 shadow-xl">
        <p
          className="text-amber-300 text-3xl md:text-4xl tracking-[0.5em]"
          style={{ fontFamily: fontStyle, fontWeight: 'normal' }}
        >
          {horizontal}
        </p>
      </div>

      {/* 上联 + 下联 */}
      <div className="flex gap-6 md:gap-10 items-start">
        {/* 上联 (right side in traditional layout) */}
        <div className="bg-red-700 border-4 border-amber-500 px-4 py-6 shadow-xl min-h-[280px] flex items-center">
          <p
            className="text-amber-300 text-2xl md:text-3xl leading-relaxed"
            style={{
              writingMode: "vertical-rl",
              fontFamily: fontStyle,
              letterSpacing: "0.3em",
              fontWeight: 'normal',
            }}
          >
            {upper}
          </p>
        </div>

        {/* 下联 (left side in traditional layout) */}
        <div className="bg-red-700 border-4 border-amber-500 px-4 py-6 shadow-xl min-h-[280px] flex items-center">
          <p
            className="text-amber-300 text-2xl md:text-3xl leading-relaxed"
            style={{
              writingMode: "vertical-rl",
              fontFamily: fontStyle,
              letterSpacing: "0.3em",
              fontWeight: 'normal',
            }}
          >
            {lower}
          </p>
        </div>
      </div>
    </div>
  );
}
