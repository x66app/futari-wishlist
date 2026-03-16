"use client";

import { Wish, CATEGORIES } from "@/types";
import { supabase } from "@/lib/supabase";

type Props = {
  wish: Wish;
  onAccept: () => void;
  onSkip: () => void;
};

function getCategoryIcon(category: string) {
  const found = CATEGORIES.find((c) => c.label === category);
  return found ? found.icon : "📦";
}

function renderStars(motivation: number) {
  return "★".repeat(motivation) + "☆".repeat(5 - motivation);
}

export default function SuggestPopup({ wish, onAccept, onSkip }: Props) {
  const handleAccept = async () => {
    await supabase
      .from("wishes")
      .update({ status: "計画中" })
      .eq("id", wish.id);
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
        <p className="text-sm text-gray-500 mb-3">次これどう？</p>
        <p className="text-2xl mb-2">{getCategoryIcon(wish.category)}</p>
        <p className="text-lg font-bold text-gray-800 mb-1">{wish.title}</p>
        <p className="text-xs text-gray-400 mb-1">{wish.category}</p>
        <p className="text-xs text-yellow-500 tracking-wider mb-6">
          {renderStars(wish.motivation)}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onSkip}
            className="flex-1 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm hover:bg-gray-200 transition"
          >
            また今度
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 py-2 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition"
          >
            いいね
          </button>
        </div>
      </div>
    </div>
  );
}
