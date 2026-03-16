"use client";

import { useState } from "react";
import { CATEGORIES } from "@/types";

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

export function isFilterActive(filter: FilterState): boolean {
  return (
    filter.category !== "全部" ||
    filter.distanceMax !== 5 ||
    filter.timingMax !== 5 ||
    filter.budgetMax !== 5 ||
    filter.motivationMin !== 1
  );
}

type Props = {
  filter: FilterState;
  onApply: (filter: FilterState) => void;
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
    onClose();
  };

  const handleClear = () => {
    setCategory("全部");
    setDistanceMax(5);
    setTimingMax(5);
    setBudgetMax(5);
    setMotivationMin(1);
    onApply(DEFAULT_FILTER);
    onClose();
  };

  return (
    <div className="mx-4 mb-3 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* ジャンル */}
      <div className="mb-4">
        <span className="text-xs text-gray-500 block mb-2">ジャンル</span>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategory("全部")}
            className={`px-3 py-1.5 rounded-lg text-xs transition ${
              category === "全部"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全部
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setCategory(cat.label)}
              className={`px-3 py-1.5 rounded-lg text-xs transition ${
                category === cat.label
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 距離感 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">距離感（以下）</span>
          <span className="text-xs text-gray-400">{distanceMax}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-12 text-right">近い</span>
          <input
            type="range"
            min={1}
            max={5}
            value={distanceMax}
            onChange={(e) => setDistanceMax(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-800"
          />
          <span className="text-xs text-gray-400 w-12">遠い</span>
        </div>
      </div>

      {/* いつ頃 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">いつ頃（以下）</span>
          <span className="text-xs text-gray-400">{timingMax}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-12 text-right">すぐ</span>
          <input
            type="range"
            min={1}
            max={5}
            value={timingMax}
            onChange={(e) => setTimingMax(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-800"
          />
          <span className="text-xs text-gray-400 w-12">いつか</span>
        </div>
      </div>

      {/* 予算感 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">予算感（以下）</span>
          <span className="text-xs text-gray-400">{budgetMax}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-12 text-right">安い</span>
          <input
            type="range"
            min={1}
            max={5}
            value={budgetMax}
            onChange={(e) => setBudgetMax(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-800"
          />
          <span className="text-xs text-gray-400 w-12">高い</span>
        </div>
      </div>

      {/* モチベ */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">モチベ（以上）</span>
          <span className="text-xs text-gray-400">{motivationMin}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-12 text-right">まあまあ</span>
          <input
            type="range"
            min={1}
            max={5}
            value={motivationMin}
            onChange={(e) => setMotivationMin(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-800"
          />
          <span className="text-xs text-gray-400 w-12">めっちゃ</span>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="flex-1 py-2 text-gray-400 text-sm hover:text-gray-600 transition"
        >
          クリア
        </button>
        <button
          onClick={handleApply}
          className="flex-1 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition"
        >
          適用
        </button>
      </div>
    </div>
  );
}
