"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Reward } from "@/types";

type Props = {
  onClose: () => void;
};

export default function RewardSettings({ onClose }: Props) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState("");
  const [content, setContent] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchRewards = async () => {
    const { data } = await supabase
      .from("rewards")
      .select("*")
      .order("threshold", { ascending: true });
    if (data) setRewards(data as Reward[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleAdd = async () => {
    const num = parseInt(threshold);
    if (!num || num < 1 || !content.trim()) return;
    setAdding(true);
    await supabase
      .from("rewards")
      .insert({ threshold: num, content: content.trim(), unlocked: false });
    setThreshold("");
    setContent("");
    setAdding(false);
    fetchRewards();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("rewards").delete().eq("id", id);
    fetchRewards();
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
          ごほうび設定
        </h1>
      </div>

      <div className="px-4 pt-4 pb-8">
        {/* 追加フォーム */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            ごほうびを追加
          </p>
          <div className="flex gap-2 mb-2">
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="達成数"
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500"
            />
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="ごほうびの内容"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={adding}
            className="w-full py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
          >
            追加
          </button>
        </div>

        {/* 一覧 */}
        {loading ? (
          <p className="text-gray-400 text-center mt-8">読み込み中...</p>
        ) : rewards.length === 0 ? (
          <p className="text-gray-400 text-center mt-8">
            まだ設定されていません
          </p>
        ) : (
          <div className="space-y-2">
            {rewards.map((r) => (
              <div
                key={r.id}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  r.unlocked
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {r.threshold}個達成 → {r.content}
                  </p>
                  <p className="text-xs text-gray-400">
                    {r.unlocked ? "解放済み" : "未解放"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-gray-400 text-xs hover:text-red-500 transition"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
