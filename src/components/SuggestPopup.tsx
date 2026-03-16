"use client";

import { Wish, CATEGORIES } from "@/types";
import { supabase } from "@/lib/supabase";

type Props = {
  wish: Wish;
  onAccept: () => void;
  onSkip: () => void;
};

function getCategoryIcon(category: string): string {
  const found = CATEGORIES.find((c) => c.label === category);
  return found ? found.icon : "📦";
}

function renderStars(motivation: number): string {
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
        <p className="text-sm text-gray-500 mb-4">次はこれ、どう？</p>
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <span className="text-2xl">
            {getCategoryIcon(wish.category)}
          </span>
          <p className="font-medium text-gray-800 mt-2">{wish.title}</p>
          <p className="text-xs text-gray-400 mt-1">{wish.category}</p>
          <p className="text-xs text-yellow-500 mt-1">
            {renderStars(wish.motivation)}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-2 text-gray-400 text-sm hover:text-gray-600 transition"
          >
            また今度
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition"
          >
            いいね！
          </button>
        </div>
      </div>
    </div>
  );
}
