"use client";

import { Wish, CATEGORIES } from "@/types";
import { supabase } from "@/lib/supabase";

type Props = {
  wishes: Wish[];
  onUpdate: () => void;
  onClose: () => void;
};

function getCategoryIcon(category: string): string {
  const found = CATEGORIES.find((c) => c.label === category);
  return found ? found.icon : "📦";
}

function renderStars(motivation: number): string {
  return "★".repeat(motivation) + "☆".repeat(5 - motivation);
}

function getSeasonLabel(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const endMonth = ((month + 1) % 12) + 1;

  const monthName = (m: number) => `${m}月`;

  if (endMonth > month) {
    return `${monthName(month)}〜${monthName(endMonth)}`;
  } else {
    return `${monthName(month)}〜${monthName(endMonth)}`;
  }
}

function getSeasonTimingValues(): number[] {
  // timing 1（今すぐ）〜 3（2〜3ヶ月以内）を対象
  return [1, 2, 3];
}

export default function SeasonPopup({ wishes, onUpdate, onClose }: Props) {
  const timingValues = getSeasonTimingValues();
  const seasonLabel = getSeasonLabel();

  const seasonWishes = wishes.filter(
    (w) => w.status === "やりたい" && timingValues.includes(w.timing)
  );

  const handlePlan = async (id: string) => {
    await supabase
      .from("wishes")
      .update({ status: "計画中" })
      .eq("id", id);
    onUpdate();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <p className="text-center text-sm text-gray-500 mb-1">
          🗓 いまの季節にぴったり
        </p>
        <p className="text-center text-xs text-gray-400 mb-4">
          （{seasonLabel}のおすすめ）
        </p>

        {seasonWishes.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">
              今の季節のやりたいことはないよ。
            </p>
            <p className="text-gray-400 text-xs mt-1">
              追加してみる？
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-3">
            {seasonWishes.map((wish) => (
              <div
                key={wish.id}
                className="bg-gray-50 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getCategoryIcon(wish.category)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {wish.title}
                    </p>
                    <p className="text-xs text-yellow-500">
                      {renderStars(wish.motivation)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePlan(wish.id)}
                  className="px-3 py-1 bg-gray-800 text-white rounded-full text-xs hover:bg-gray-700 transition whitespace-nowrap"
                >
                  計画中にする！
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-gray-400 text-sm hover:text-gray-600 transition"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
