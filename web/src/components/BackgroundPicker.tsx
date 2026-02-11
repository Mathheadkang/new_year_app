"use client";

interface BackgroundPickerProps {
  selected: string | null; // null = default red
  onChange: (bg: string | null) => void;
}

const backgrounds = [
  { value: null, label: "默认红色" },
  { value: "/horse_background/horse1.jpg", label: "马年背景 1" },
  { value: "/horse_background/horse2.jpg", label: "马年背景 2" },
  { value: "/horse_background/horse3.jpg", label: "马年背景 3" },
  { value: "/horse_background/horse4.jpg", label: "马年背景 4" },
  { value: "/horse_background/horse5.jpg", label: "马年背景 5" },
  { value: "/horse_background/horse6.jpg", label: "马年背景 6" },
] as const;

export default function BackgroundPicker({ selected, onChange }: BackgroundPickerProps) {
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="grid grid-cols-3 gap-3 justify-items-center">
        {backgrounds.map((bg) => {
          const isSelected = selected === bg.value;
          return (
            <button
              key={bg.value ?? "default"}
              type="button"
              onClick={() => onChange(bg.value)}
              className={`relative rounded-lg overflow-hidden border-2 transition-all w-full aspect-[2/3] ${
                isSelected
                  ? "border-amber-400 shadow-lg shadow-amber-500/30 scale-105"
                  : "border-amber-700/30 hover:border-amber-500/50"
              }`}
            >
              {bg.value ? (
                <img
                  src={bg.value}
                  alt={bg.label}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full bg-red-900 flex items-center justify-center">
                  <span className="text-amber-300 text-sm font-bold">默认</span>
                </div>
              )}
              {isSelected && (
                <div className="absolute inset-0 bg-amber-400/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-amber-300 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
