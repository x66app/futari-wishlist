"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@/types";
import CategoryPicker from "./CategoryPicker";
import Slider from "./Slider";

type Props = {
  onAdded: () => void;
  onClose: () => void;
};

export default function AddWishForm({ onAdded, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [distance, setDistance] = useState(3);
  const [timing, setTiming] = useState(3);
  const [budget, setBudget] = useState(3);
  const [motivation, setMotivation] = useState(3);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("なにしたいか入力してね");
      return;
    }
    if (!category) {
      setError("ジャンルを選んでね");
      return;
    }
    setError("");
    setSubmitting(true);

    const { error: dbError } = await supabase.from("wishes").insert({
      title: title.trim(),
      category,
      distance,
      timing,
      budget,
      motivation,
      status: "やりたい",
    });

    setSubmitting(false);
    if (dbError) {
      setError("保存に失敗しました…");
      return;
    }
    onAdded();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white pt-12 pb-3 px-4 flex items-center">
        <button
          onClick={onClose}
          className="text-gray-400 text-sm hover:text-gray-600 transition"
        >
          ← 戻る
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-800 pr-8">
          やりたいこと追加
        </h1>
      </div>

      <div className="px-4 pt-4 pb-8 space-y-6">
        {/* タイトル入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            なにしたい？
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：温泉に行く"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-gray-500 transition"
          />
        </div>

        {/* ジャンル選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ジャンル
          </label>
          <CategoryPicker selected={category} onSelect={setCategory} />
        </div>

        {/* スライダー */}
        <Slider
          label="距離感"
          value={distance}
          onChange={setDistance}
          minLabel="自宅"
          maxLabel="海外"
        />
        <Slider
          label="いつ頃"
          value={timing}
          onChange={setTiming}
          minLabel="今すぐ"
          maxLabel="いつか"
        />
        <Slider
          label="予算感"
          value={budget}
          onChange={setBudget}
          minLabel="無料"
          maxLabel="10万〜"
        />
        <Slider
          label="モチベ"
          value={motivation}
          onChange={setMotivation}
          minLabel="あったら"
          maxLabel="絶対！"
        />

        {/* エラー */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* 追加ボタン */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
        >
          {submitting ? "追加中..." : "追加する！"}
        </button>
      </div>
    </div>
  );
}
