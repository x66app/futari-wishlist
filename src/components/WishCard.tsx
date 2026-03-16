"use client";

import { Wish, CATEGORIES } from "@/types";

type Props = { wish: Wish; onClick: () => void };

function getStatusColor(status: string) {
  switch (status) {
    case "やりたい":
      return "bg-white border-gray-200";
    case "計画中":
      return "bg-orange-50 border-orange-200";
    case "達成！":
      return "bg-yellow-50 border-yellow-300";
    default:
      return "bg-white border-gray-200";
  }
}

function getCategoryIcon(category: string) {
  const found = CATEGORIES.find((c) => c.label === category);
  return found ? found.icon : "📦";
}

function renderStars(motivation: number) {
  return "★".repeat(motivation) + "☆".repeat(5 - motivation);
}

export default function WishCard({ wish, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`mx-4 mb-3 p-4 rounded-xl border shadow-sm cursor-pointer active:scale-[0.98] transition-transform ${getStatusColor(wish.status)}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getCategoryIcon(wish.category)}</span>
          <div>
            <p className="font-medium text-gray-800">{wish.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {wish.category}
              {wish.done_date && ` ・ ${wish.done_date}`}
            </p>
          </div>
        </div>
        <span className="text-xs text-yellow-500 tracking-wider">
          {renderStars(wish.motivation)}
        </span>
      </div>
      {wish.memo && (
        <p className="text-xs text-gray-500 mt-2 pl-8 line-clamp-2">
          📝 {wish.memo}
        </p>
      )}
      {wish.done_comment && wish.status === "達成！" && (
        <p className="text-xs text-gray-500 mt-1 pl-8">
          「{wish.done_comment}」
        </p>
      )}
    </div>
  );
}
