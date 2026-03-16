"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { SLIDER_LABELS } from "@/types";
import Slider from "./Slider";
import CategoryPicker from "./CategoryPicker";

type Props = {
  onClose: () => void;
  onAdded: () => void;
};

export default function AddWishForm({ onClose, onAdded }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [distance, setDistance] = useState(3);
  const [timing, setTiming] = useState(3);
  const [budget, setBudget] = useState(3);
  const [motivation, setMotivation] = useState(3);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("なにしたいか入力してね");
      return;
    }
    if (!category) {
      setError("ジャンルを選んでね");
      return;
    }

    setSaving(true);

    await supabase.from("wishes").insert({
      title: title.trim(),
      category,
      distance,
      timing,
      budget,
      motivation,
      status: "やりたい",
    });

    setSaving(false);
    onAdded();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* ヘッダー */}
      <div className="bg-white pt-12 pb-4 px-4 flex items-center">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          ← 戻る
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex-1 text-center pr-8">
          ✏️ やりたいこと追加
        </h1>
      </div>

      <div className="px-6 pt-6">
        {/* タイトル */}
        <div className="mb-6">
          <label className="text-xs text-gray-500 block mb-2">
            なにしたい？ <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError("");
            }}
            placeholder="例：温泉に行く"
            className="w-full border-b-2 border-gray-300 focus:border-gray-800 outline-none bg-transparent py-2 text-gray-800"
            autoFocus
          />
        </div>

        {/* ジャンル */}
        <div className="mb-2">
          <span className="text-red-400 text-xs">*</span>
        </div>
        <CategoryPicker value={category} onChange={(v) => { setCategory(v); setError(""); }} />

        {/* スライダー */}
        <Slider
          label="距離感"
          min={SLIDER_LABELS.distance.min}
          max={SLIDER_LABELS.distance.max}
          value={distance}
          onChange={setDistance}
        />
        <Slider
          label="いつ頃"
          min={SLIDER_LABELS.timing.min}
          max={SLIDER_LABELS.timing.max}
          value={timing}
          onChange={setTiming}
        />
        <Slider
          label="予算感"
          min={SLIDER_LABELS.budget.min}
          max={SLIDER_LABELS.budget.max}
          value={budget}
          onChange={setBudget}
        />
        <Slider
          label="モチベ"
          min={SLIDER_LABELS.motivation.min}
          max={SLIDER_LABELS.motivation.max}
          value={motivation}
          onChange={setMotivation}
        />

        {/* エラー */}
        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        {/* 追加ボタン */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-3 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition disabled:opacity-50 mt-4"
        >
          {saving ? "追加中..." : "🎯 追加する！"}
        </button>
      </div>
    </div>
  );
}
