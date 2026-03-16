"use client";

type Props = {
  label: string;
  min: string;
  max: string;
  value: number;
  onChange: (value: number) => void;
};

export default function Slider({ label, min, max, value, onChange }: Props) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs text-gray-400">{value}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-12 text-right">{min}</span>
        <input
          type="range"
          min={1}
          max={5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-800"
        />
        <span className="text-xs text-gray-400 w-12">{max}</span>
      </div>
    </div>
  );
}
