"use client";

import { CATEGORIES } from "@/types";

type Props = {
  selected: string;
  onSelect: (category: string) => void;
};

export default function CategoryPicker({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.label}
          type="button"
          onClick={() => onSelect(cat.label)}
          className={`flex flex-col items-center px-3 py-2 rounded-xl border text-sm transition ${
            selected === cat.label
              ? "bg-gray-800 text-white border-gray-800"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          <span className="text-lg mb-0.5">{cat.icon}</span>
          <span className="text-xs">{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
