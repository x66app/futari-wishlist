"use client";

import { useState } from "react";
import { CATEGORIES } from "@/types";
import Slider from "./Slider";

export type FilterState = {
  category: string;
  distanceMax: number;
  timingMax: number;
  budgetMax: number;
  motivationMin: number;
};

export const DEFAULT_FILTER: FilterState = {
  category: "全部",
  distanceMax: 5,
  timingMax: 5,
  budgetMax: 5,
  motivationMin: 1,
};

export function isFilterActive(f: FilterState): boolean {
  return (
    f.category !== "全部" ||
    f.distanceMax !== 5 ||
    f.timingMax !== 5 ||
    f.budgetMax !== 5 ||
    f.motivationMin !== 1
  );
}

type Props = {
  filter: FilterState;
  onApply: (f: FilterState) => void;
  onClose: () => void;
};

export default function FilterPanel({ filter, onApply, onClose }: Props) {
  const [category, setCategory] = useState(filter.category);
  const [distanceMax, setDistanceMax] = useState(filter.distanceMax);
  const [timingMax, setTimingMax] = useState(filter.timingMax);
  const [budgetMax, setBudgetMax] = useState(filter.budgetMax);
  const [motivationMin, setMotivationMin] = useState(filter.motivationMin);

  const handleApply = () => {
    onApply({ category, distanceMax, timingMax, budgetMax, motivationMin });
  };

  const handleClear = () => {
    onApply(DEFAULT_FILTER);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4 space-y-4">
      {/* ジャンル */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">ジャンル</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("全部")}
            className={`px-3 py-1 rounded-full text-xs transition ${
              category === "全部"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            全部
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setCategory(cat.label)}
              className={`px-3 py-1 rounded-full text-xs transition ${
                category === cat.label
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* スライダー */}
      <Slider
        label="距離感（以下）"
        value={distanceMax}
        onChange={setDistanceMax}
        minLabel="自宅"
        maxLabel="海外"
      />
      <Slider
        label="いつ頃（以下）"
        value={timingMax}
        onChange={setTimingMax}
        minLabel="今すぐ"
        maxLabel="いつか"
      />
      <Slider
        label="予算感（以下）"
        value={budgetMax}
        onChange={setBudgetMax}
        minLabel="無料"
        maxLabel="10万〜"
      />
      <Slider
        label="モチベ（以上）"
        value={motivationMin}
        onChange={setMotivationMin}
        minLabel="あったら"
        maxLabel="絶対！"
      />

      {/* ボタン */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleClear}
          className="flex-1 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm hover:bg-gray-200 transition"
        >
          クリア
        </button>
        <button
          onClick={handleApply}
          className="flex-1 py-2 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition"
        >
          適用
        </button>
      </div>
    </div>
  );
}
