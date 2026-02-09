"use client";

import { useState, useEffect } from "react";

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdComplete: () => void;
}

export default function AdModal({ isOpen, onClose, onAdComplete }: AdModalProps) {
  const [watching, setWatching] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!watching) return;

    if (countdown <= 0) {
      setWatching(false);
      setCountdown(5);
      onAdComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [watching, countdown, onAdComplete]);

  if (!isOpen) return null;

  const handleWatchAd = () => {
    setWatching(true);
    setCountdown(5);
  };

  const handleClose = () => {
    if (!watching) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-gradient-to-b from-red-900 to-red-950 rounded-2xl p-6 max-w-sm w-full border border-amber-600/30 shadow-2xl">
        {watching ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-600/20 flex items-center justify-center">
              <span className="text-4xl font-bold text-amber-400">{countdown}</span>
            </div>
            <p className="text-amber-200 text-lg mb-2">广告播放中...</p>
            <p className="text-amber-400/60 text-sm">请稍候，{countdown}秒后可继续</p>
            {/* 这里可以放置实际的广告组件，如 Google AdSense */}
            <div className="mt-6 h-32 bg-red-950/50 rounded-lg border border-amber-700/30 flex items-center justify-center">
              <p className="text-amber-400/40 text-sm">广告位</p>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-600/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-amber-300 mb-2">
                今日免费次数已用完
              </h3>
              <p className="text-amber-200/70 text-sm leading-relaxed">
                您今日的 3 次免费生成机会已用完。
                <br />
                观看一段短视频广告即可获得额外 3 次机会。
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 rounded-lg border border-amber-600/50 text-amber-200 hover:bg-amber-600/10 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleWatchAd}
                className="flex-1 px-4 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors"
              >
                观看广告
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
