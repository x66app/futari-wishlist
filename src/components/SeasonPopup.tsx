"use client";

import { Wish, CATEGORIES } from "@/types";
import { supabase } from "@/lib/supabase";

type Props = {
  wishes: Wish[];
  onUpdate: () => void;
  onClose: () => void;
};

function getCategoryIcon(category: string) {
  const found = CATEGORIES.find((c) => c.label === category);
  return found ? found.icon : "📦";
}

function getSeasonLabel(month: number): string {
  if (month >= 3 && month <= 5) return "春";
  if (month >= 6 && month <= 8) return "夏";
  if (month >= 9 && month <= 11) return "秋";
  return "冬";
}

export default function SeasonPopup({ wishes, onUpdate, onClose }: Props) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const season = getSeasonLabel(currentMonth);

  const candidates = wishes.filter(
    (w) => w.status === "やりたい" && w.timing <= 3
  );

  const handlePlan = async (id: string) => {
    await supabase.from("wishes").update({ status: "計画中" }).eq("id", id);
    onUpdate();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <p className="text-sm text-gray-500 text-center mb-1">
          今は{season}（{currentMonth}月）
        </p>
        <p className="text-lg font-bold text-gray-800 text-center mb-4">
          おすすめ
        </p>

        {candidates.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            該当なし
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {candidates.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getCategoryIcon(w.category)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {w.title}
                    </p>
                    <p className="text-xs text-gray-400">{w.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePlan(w.id)}
                  className="px-3 py-1 bg-gray-800 text-white rounded-lg text-xs hover:bg-gray-700 transition"
                >
                  計画中へ
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm hover:bg-gray-200 transition"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
