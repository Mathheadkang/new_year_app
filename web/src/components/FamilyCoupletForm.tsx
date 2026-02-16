"use client";

import { useState } from "react";
import { FontFamily } from "@/lib/types";
import { FAMILY_RELATIONSHIPS, FONTS } from "@/lib/constants";

interface FamilyCoupletFormProps {
  onGenerate: (name1: string, name2: string, relationship: string) => void;
  loading: boolean;
  onFontChange: (font: FontFamily) => void;
  selectedFont: FontFamily;
  remainingFree: number;
  refreshTimeLeft: string;
}

export default function FamilyCoupletForm({
  onGenerate,
  loading,
  onFontChange,
  selectedFont,
  remainingFree,
  refreshTimeLeft,
}: FamilyCoupletFormProps) {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [relationship, setRelationship] = useState("");
  const [customRelationship, setCustomRelationship] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name1.trim() || !name2.trim() || loading) return;
    const rel = useCustom ? customRelationship.trim() : relationship;
    if (!rel) return;
    onGenerate(name1.trim(), name2.trim(), rel);
  };

  const handleRelSelect = (rel: string) => {
    setRelationship(rel);
    setUseCustom(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-amber-100 text-sm font-medium mb-2">
            姓名一（1-4字）
          </label>
          <input
            type="text"
            value={name1}
            onChange={(e) => setName1(e.target.value)}
            maxLength={4}
            placeholder="请输入姓名"
            className="w-full px-4 py-3 rounded-lg bg-red-950/50 border border-amber-600/50 text-amber-50 placeholder-amber-300/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-center text-lg tracking-widest"
          />
        </div>
        <div>
          <label className="block text-amber-100 text-sm font-medium mb-2">
            姓名二（1-4字）
          </label>
          <input
            type="text"
            value={name2}
            onChange={(e) => setName2(e.target.value)}
            maxLength={4}
            placeholder="请输入姓名"
            className="w-full px-4 py-3 rounded-lg bg-red-950/50 border border-amber-600/50 text-amber-50 placeholder-amber-300/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-center text-lg tracking-widest"
          />
        </div>
      </div>

      <div>
        <label className="block text-amber-100 text-sm font-medium mb-2">
          关系
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {FAMILY_RELATIONSHIPS.map((rel) => (
            <button
              key={rel}
              type="button"
              onClick={() => handleRelSelect(rel)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                !useCustom && relationship === rel
                  ? "bg-amber-600 border-amber-400 text-white shadow-lg"
                  : "bg-red-950/30 border-amber-700/30 text-amber-200 hover:border-amber-500/50"
              }`}
            >
              {rel}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setUseCustom(true); setRelationship(""); }}
            className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
              useCustom
                ? "bg-amber-600 border-amber-400 text-white shadow-lg"
                : "bg-red-950/30 border-amber-700/30 text-amber-200 hover:border-amber-500/50"
            }`}
          >
            自定义
          </button>
        </div>
        {useCustom && (
          <input
            type="text"
            value={customRelationship}
            onChange={(e) => setCustomRelationship(e.target.value)}
            placeholder="请输入关系"
            className="w-full px-4 py-2 rounded-lg bg-red-950/50 border border-amber-600/50 text-amber-50 placeholder-amber-300/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm"
          />
        )}
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
          {FONTS.map((f) => (
            <option key={f.value} value={f.value} className="bg-red-950">
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={!name1.trim() || !name2.trim() || (!relationship && (!useCustom || !customRelationship.trim())) || loading}
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

      <div className="flex flex-col items-center gap-1">
        <p className="text-center text-sm text-amber-400/60 rounded-md bg-red-950/50 border border-amber-700/30 px-3 py-1">
          剩余免费次数：
          <span className={remainingFree > 0 ? "text-amber-300" : "text-red-400"}>
            {remainingFree}
          </span>
          /5
        </p>
        {remainingFree === 0 && refreshTimeLeft && (
          <p className="text-center text-xs text-amber-400/50 flex items-center justify-center gap-1">
            <span>⏳</span>
            {refreshTimeLeft}
          </p>
        )}
      </div>
    </form>
  );
}
