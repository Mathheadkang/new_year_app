"use client";

import { useState, useRef, useEffect } from "react";

export default function ContactUs() {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭弹窗
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <>
      {/* 左上角悬浮按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 bg-red-800/90 hover:bg-red-700 text-amber-200 text-sm font-medium px-3 py-1.5 rounded-lg border border-amber-600/50 shadow-lg backdrop-blur-sm transition-colors cursor-pointer"
      >
        📬 联系我们
      </button>

      {/* 弹窗遮罩 + 弹窗 */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div
            ref={modalRef}
            className="bg-red-950 border border-amber-600/60 rounded-2xl shadow-2xl w-[90vw] max-w-sm p-6 text-amber-100"
          >
            {/* 标题 */}
            <h2
              className="text-xl font-bold text-amber-300 text-center mb-4"
              style={{ fontFamily: "'STKaiti', 'KaiTi', 'SimSun', serif" }}
            >
              联系我们
            </h2>

            {/* 社交媒体列表 */}
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="shrink-0">📧</span>
                <div>
                  <p className="font-semibold text-amber-200">邮箱</p>
                  <p className="text-amber-100/80">shanshanxun0904 at gmail.com</p>
                </div>
              </li>

              {/* <li className="flex items-start gap-2">
                <span className="shrink-0">💬</span>
                <div>
                  <p className="font-semibold text-amber-200">微信公众号</p>
                  <p className="text-amber-100/80">（请填写公众号名称）</p>
                </div>
              </li> */}


              <li className="flex items-start gap-2">
                <span className="shrink-0">🔗</span>
                <div>
                  <p className="font-semibold text-amber-200">GitHub</p>
                  <a href="https://github.com/Mathheadkang" className="text-amber-100/80" target="_blank" rel="noopener noreferrer">https://github.com/Mathheadkang</a>
                </div>
              </li>

              <li className="flex items-start gap-2">
                <span className="shrink-0">📱</span>
                <div>
                  <p className="font-semibold text-amber-200">小红书</p>
                <a href="https://www.xiaohongshu.com/user/profile/6676e6760000000007005f8e?xsec_token=YBHQoxN3H_zT7u6IcASHJnoWGhvxnljgxttL4Uujp5iBY=&xsec_source=app_share&xhsshare=WeixinSession&shareRedId=ODw5Nkg7Oz82NzUyOTgwNjY6OTc5Sz5O&apptime=1770624815&share_id=ceb47b08732044448683dd28381a1e0b&wechatWid=5186ff88cf9e0829ba6473dde1494a55&wechatOrigin=menu" className="text-amber-100/80" target="_blank" rel="noopener noreferrer">94747109460</a>

                </div>
              </li>
            </ul>

            {/* 关闭按钮 */}
            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
}
