"use client";

import { useState } from "react";
import { HidePosition, FontFamily } from "@/lib/types";

interface CoupletFormProps {
  onGenerate: (name: string, position: HidePosition) => void;
  loading: boolean;
  onFontChange: (font: FontFamily) => void;
  selectedFont: FontFamily;
}

const positions: { value: HidePosition; label: string; desc: string }[] = [
  { value: "head", label: "藏头", desc: "名字藏在每句开头" },
  { value: "middle", label: "藏中", desc: "名字藏在每句中间" },
  { value: "tail", label: "藏尾", desc: "名字藏在每句末尾" },
];

const fonts: { value: FontFamily; label: string }[] = [
  { value: "default", label: "系统楷体" },
  { value: "zhengqing", label: "正卿南北朝公牍松体" },
  { value: "liujianmaocao", label: "刘建毛草" },
  { value: "mashanzheng", label: "马善政楷书" },
  { value: "zhimangxing", label: "志莽行书" },
];

export default function CoupletForm({ onGenerate, loading, onFontChange, selectedFont }: CoupletFormProps) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState<HidePosition>("head");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;
    onGenerate(name.trim(), position);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-5">
      <div>
        <label className="block text-amber-100 text-sm font-medium mb-2">
          输入姓名（1-4个字）
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={4}
          placeholder="请输入姓名"
          className="w-full px-4 py-3 rounded-lg bg-red-950/50 border border-amber-600/50 text-amber-50 placeholder-amber-300/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-center text-lg tracking-widest"
        />
      </div>

      <div>
        <label className="block text-amber-100 text-sm font-medium mb-2">
          藏字方式
        </label>
        <div className="grid grid-cols-3 gap-2">
          {positions.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPosition(p.value)}
              className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                position === p.value
                  ? "bg-amber-600 border-amber-400 text-white shadow-lg"
                  : "bg-red-950/30 border-amber-700/30 text-amber-200 hover:border-amber-500/50"
              }`}
            >
              <div className="font-bold">{p.label}</div>
              <div className="text-xs opacity-75 mt-0.5">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-amber-100 text-sm font-medium mb-2">
          书法字体
        </label>
        <select
          value={selectedFont}
          onChange={(e) => onFontChange(e.target.value as FontFamily)}
          className="w-full px-4 py-3 rounded-lg bg-red-950/50 border border-amber-600/50 text-amber-50 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
        >
          {fonts.map((f) => (
            <option key={f.value} value={f.value} className="bg-red-950">
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={!name.trim() || loading}
        className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 disabled:cursor-not-allowed text-white font-bold text-lg tracking-wider transition-colors shadow-lg"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            生成中...
          </span>
        ) : (
          "生成春联"
        )}
      </button>
    </form>
  );
}
