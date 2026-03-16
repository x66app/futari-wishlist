"use client";

type Props = {
  done: number;
  total: number;
};

function getMessage(rate: number): string {
  if (rate === 0) return "まだまだこれから！";
  if (rate < 30) return "スタートしたね！";
  if (rate < 50) return "いい感じ！";
  if (rate < 70) return "半分制覇！";
  if (rate < 90) return "あと少し！";
  if (rate < 100) return "もうすぐ全制覇！";
  return "全制覇おめでとう！";
}

export default function ProgressBar({ done, total }: Props) {
  const rate = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="px-4 py-3">
      <p className="text-sm text-gray-600 mb-1">
        ✨ 達成 {done} / {total}
      </p>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${rate}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{getMessage(rate)}</p>
    </div>
  );
}
