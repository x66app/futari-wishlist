"use client";

import { CATEGORIES } from "@/types";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function CategoryPicker({ value, onChange }: Props) {
  return (
    <div className="mb-4">
      <span className="text-xs text-gray-500 block mb-2">ジャンル</span>
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            type="button"
            onClick={() => onChange(cat.label)}
            className={`flex flex-col items-center px-3 py-2 rounded-lg text-xs transition ${
              value === cat.label
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="text-lg mb-0.5">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
