"use client";

import { SystemType } from "@/lib/types";
import { SYSTEMS } from "@/lib/constants";

interface SystemSelectorProps {
  value: SystemType;
  onChange: (system: SystemType) => void;
}

export default function SystemSelector({ value, onChange }: SystemSelectorProps) {
  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SystemType)}
        className="w-full px-4 py-3 rounded-lg bg-red-950/50 border border-amber-600/50 text-amber-50 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-center text-lg"
      >
        {SYSTEMS.map((s) => (
          <option key={s.value} value={s.value} className="bg-red-950">
            {s.label} — {s.description}
          </option>
        ))}
      </select>
    </div>
  );
}
