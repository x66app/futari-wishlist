"use client";

import { useState } from "react";
import { Wish, STATUSES, CATEGORIES } from "@/types";
import { supabase } from "@/lib/supabase";
import CategoryPicker from "./CategoryPicker";
import Slider from "./Slider";

type Props = {
  wish: Wish;
  onUpdate: () => void;
  onDone: (wish: Wish) => void;
  onClose: () => void;
};

function getCategoryIcon(category: string) {
  const found = CATEGORIES.find((c) => c.label === category);
  return found ? found.icon : "📦";
}

export default function WishCardExpanded({ wish, onUpdate, onDone, onClose }: Props) {
  const [title, setTitle] = useState(wish.title);
  const [category, setCategory] = useState(wish.category);
  const [distance, setDistance] = useState(wish.distance);
  const [timing, setTiming] = useState(wish.timing);
  const [budget, setBudget] = useState(wish.budget);
  const [motivation, setMotivation] = useState(wish.motivation);
  const [memo, setMemo] = useState(wish.memo || "");
  const [status, setStatus] = useState(wish.status);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const updates: Record<string, unknown> = {
      title: title.trim(),
      category,
      distance,
      timing,
      budget,
      motivation,
      memo: memo.trim(),
      status,
    };

    if (status === "達成！" && wish.status !== "達成！") {
      updates.done_date = new Date().toISOString().split("T")[0];
    }

    await supabase.from("wishes").update(updates).eq("id", wish.id);
    setSaving(false);

    if (status === "達成！" && wish.status !== "達成！") {
      onDone({ ...wish, ...updates } as unknown as Wish);
    } else {
      onUpdate();
    }
  };

  const handleDelete = async () => {
    await supabase.from("wishes").delete().eq("id", wish.id);
    onUpdate();
  };

  return (
    <div className="mx-4 mb-3 p-4 rounded-xl border border-gray-300 bg-white shadow-md">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl">{getCategoryIcon(wish.category)}</span>
        <button
          onClick={onClose}
          className="text-gray-400 text-sm hover:text-gray-600 transition"
        >
          ✕
        </button>
      </div>

      {/* タイトル編集 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          タイトル
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-gray-500 transition"
        />
      </div>

      {/* ジャンル選択 */}
      <CategoryPicker selected={category} onSelect={setCategory} />

      {/* スライダー */}
      <div className="mt-4 space-y-4">
        <Slider label="距離感" value={distance} onChange={setDistance} minLabel="自宅" maxLabel="海外" />
        <Slider label="いつ頃" value={timing} onChange={setTiming} minLabel="今すぐ" maxLabel="いつか" />
        <Slider label="予算感" value={budget} onChange={setBudget} minLabel="無料" maxLabel="10万〜" />
        <Slider label="モチベ" value={motivation} onChange={setMotivation} minLabel="あったら" maxLabel="絶対！" />
      </div>

      {/* メモ欄 */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メモ
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="詳細やアイデアなど"
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-gray-500 transition resize-none h-20"
        />
      </div>

      {/* ステータスボタン */}
      <div className="mt-4 flex gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
              status === s
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* 保存・削除 */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="flex-1 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
        {confirmDelete ? (
          <button
            onClick={handleDelete}
            className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
          >
            本当に削除する
          </button>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex-1 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm hover:bg-gray-200 transition"
          >
            削除
          </button>
        )}
      </div>
    </div>
  );
}
