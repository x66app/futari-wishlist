"use client";

import { useState } from "react";
import { Wish, STATUSES, SLIDER_LABELS } from "@/types";
import { supabase } from "@/lib/supabase";
import Slider from "./Slider";
import CategoryPicker from "./CategoryPicker";

type Props = {
  wish: Wish;
  onUpdate: () => void;
  onClose: () => void;
  onDone: (wish: Wish) => void;
};

export default function WishCardExpanded({ wish, onUpdate, onClose, onDone }: Props) {
  const [category, setCategory] = useState(wish.category);
  const [distance, setDistance] = useState(wish.distance);
  const [timing, setTiming] = useState(wish.timing);
  const [budget, setBudget] = useState(wish.budget);
  const [motivation, setMotivation] = useState(wish.motivation);
  const [status, setStatus] = useState(wish.status);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    const isNewlyDone = status === "達成！" && wish.status !== "達成！";

    const updateData: Record<string, unknown> = {
      category,
      distance,
      timing,
      budget,
      motivation,
      status,
    };

    if (isNewlyDone) {
      updateData.done_date = new Date().toISOString().split("T")[0];
    }

    if (status !== "達成！") {
      updateData.done_date = null;
      updateData.done_comment = null;
    }

    await supabase.from("wishes").update(updateData).eq("id", wish.id);

    setSaving(false);

    if (isNewlyDone) {
      onDone({ ...wish, ...updateData } as unknown as Wish);
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
      <p className="font-medium text-gray-800 mb-4">{wish.title}</p>

      <CategoryPicker value={category} onChange={setCategory} />

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

      {/* ステータス */}
      <div className="mb-4">
        <span className="text-xs text-gray-500 block mb-2">ステータス</span>
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                status === s
                  ? s === "やりたい"
                    ? "bg-gray-800 text-white"
                    : s === "計画中"
                    ? "bg-orange-500 text-white"
                    : "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ボタン */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 text-sm hover:text-gray-600 transition"
          >
            閉じる
          </button>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-red-400 text-sm hover:text-red-600 transition"
            >
              🗑 削除
            </button>
          ) : (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition"
            >
              本当に削除する
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
