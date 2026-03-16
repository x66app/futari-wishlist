"use client";

type Props = { done: number; total: number };

function getMessage(rate: number) {
  if (rate === 0) return "さあ、始めよう";
  if (rate < 30) return "いいスタート！";
  if (rate < 50) return "いいペース";
  if (rate < 70) return "半分超えた";
  if (rate < 90) return "あと少し";
  if (rate < 100) return "もうすぐコンプリート";
  return "全制覇！";
}

export default function ProgressBar({ done, total }: Props) {
  const rate = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="px-4 py-3">
      <p className="text-sm text-gray-600 mb-1">
        {done} / {total} 達成
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
