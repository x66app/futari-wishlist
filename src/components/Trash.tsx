"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Wish, CATEGORIES } from "@/types";

type Props = {
  onClose: () => void;
};

function getCategoryIcon(category: string) {
  const found = CATEGORIES.find((c) => c.label === category);
  return found ? found.icon : "📦";
}

export default function Trash({ onClose }: Props) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fetchDeleted = async () => {
    const { data } = await supabase
      .from("wishes")
      .select("*")
      .eq("deleted", true)
      .order("created_at", { ascending: false });
    if (data) setWishes(data as Wish[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchDeleted();
  }, []);

  const handleRestore = async (id: string) => {
    await supabase.from("wishes").update({ deleted: false }).eq("id", id);
    fetchDeleted();
  };

  const handlePermanentDelete = async (id: string) => {
    await supabase.from("wishes").delete().eq("id", id);
    setConfirmId(null);
    fetchDeleted();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white pt-12 pb-3 px-4 flex items-center">
        <button
          onClick={onClose}
          className="text-gray-400 text-sm hover:text-gray-600 transition"
        >
          ← 戻る
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-800 pr-8">
          ゴミ箱
        </h1>
      </div>

      <div className="px-4 pt-4 pb-8">
        {loading ? (
          <p className="text-gray-400 text-center mt-12">読み込み中...</p>
        ) : wishes.length === 0 ? (
          <p className="text-gray-400 text-center mt-12">
            ゴミ箱は空です
          </p>
        ) : (
          <div className="space-y-2">
            {wishes.map((w) => (
              <div
                key={w.id}
                className="bg-white p-4 rounded-xl border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getCategoryIcon(w.category)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {w.title}
                    </p>
                    <p className="text-xs text-gray-400">{w.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(w.id)}
                    className="flex-1 py-2 bg-gray-800 text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition"
                  >
                    復元
                  </button>
                  {confirmId === w.id ? (
                    <button
                      onClick={() => handlePermanentDelete(w.id)}
                      className="flex-1 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition"
                    >
                      完全に削除
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmId(w.id)}
                      className="flex-1 py-2 bg-gray-100 text-gray-500 rounded-lg text-xs hover:bg-gray-200 transition"
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
