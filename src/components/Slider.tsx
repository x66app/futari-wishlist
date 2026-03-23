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
  const options = [1, 2, 3, 4, 5];

  // 中央(3)が一番小さく、端(1,5)が一番大きい
  const getSize = (n: number) => {
    const distFromCenter = Math.abs(n - 3);
    switch (distFromCenter) {
      case 2:
        return "w-11 h-11";
      case 1:
        return "w-9 h-9";
      case 0:
        return "w-7 h-7";
      default:
        return "w-7 h-7";
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-3">{label}</p>
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400 w-10 text-right shrink-0">
          {minLabel}
        </span>
        <div className="flex-1 flex justify-between items-center px-2">
          {options.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`rounded-full transition-all duration-200 flex items-center justify-center ${getSize(n)} ${
                n === value
                  ? "border-[2.5px] border-gray-800 bg-gray-800"
                  : "border-[1.5px] border-gray-300 bg-white"
              }`}
            >
              {n === value && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400 w-10 shrink-0">
          {maxLabel}
        </span>
      </div>
    </div>
  );
}
