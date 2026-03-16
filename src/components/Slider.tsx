"use client";

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  minLabel: string;
  maxLabel: string;
};

export default function Slider({
  label,
  value,
  onChange,
  minLabel,
  maxLabel,
}: Props) {
  return (
    <div
      onTouchEnd={(e) => e.preventDefault()}
      onMouseUp={(e) => e.preventDefault()}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onFocus={(e) => e.target.blur()}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-800"
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">{minLabel}</span>
        <span className="text-xs text-gray-400">{maxLabel}</span>
      </div>
    </div>
  );
}
