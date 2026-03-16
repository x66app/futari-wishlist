"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Wish, Reward, CATEGORIES } from "@/types";

type Props = {
  onClose: () => void;
};

type TimelineItem = {
  type: "wish" | "reward";
  date: string;
  wish?: Wish;
  reward?: Reward;
};

function getCategoryIcon(category: string): string {
  const found = CATEGORIES.find((c) => c.label === category);
  return found ? found.icon : "📦";
}

function groupByMonth(items: TimelineItem[]): Record<string, TimelineItem[]> {
  const groups: Record<string, TimelineItem[]> = {};

  items.forEach((item) => {
    const date = new Date(item.date);
    const key = `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });

  return groups;
}

export default function Timeline({ onClose }: Props) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: wishes } = await supabase
        .from("wishes")
        .select("*")
        .eq("status", "達成！")
        .not("done_date", "is", null)
        .order("done_date", { ascending: false });

      const { data: rewards } = await supabase
        .from("rewards")
        .select("*")
        .eq("unlocked", true);

      const timelineItems: TimelineItem[] = [];

      if (wishes) {
        wishes.forEach((w: Wish) => {
          timelineItems.push({
            type: "wish",
            date: w.done_date!,
            wish: w,
          });
        });
      }

      if (rewards) {
        rewards.forEach((r: Reward) => {
          timelineItems.push({
            type: "reward",
            date: r.created_at.split("T")[0],
            reward: r,
          });
        });
      }

      timelineItems.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setItems(timelineItems);
      setLoading(false);
    };

    fetchData();
  }, []);

  const grouped = groupByMonth(items);

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
          📅 タイムライン
        </h1>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm mt-12">読み込み中...</p>
      ) : items.length === 0 ? (
        <div className="text-center mt-16">
          <p className="text-gray-400 text-sm">まだ達成したものがないよ</p>
          <p className="text-gray-300 text-xs mt-2">
            達成するとここに記録されていくよ！
          </p>
        </div>
      ) : (
        <div className="px-4 pt-4">
          {Object.entries(grouped).map(([month, monthItems]) => (
            <div key={month} className="mb-6">
              <p className="text-xs text-gray-400 font-medium mb-3 border-b border-gray-200 pb-1">
                ── {month} ──
              </p>
              <div className="space-y-3">
                {monthItems.map((item, i) => {
                  if (item.type === "wish" && item.wish) {
                    return (
                      <div
                        key={`wish-${i}`}
                        className="bg-yellow-50 border border-yellow-300 rounded-xl p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getCategoryIcon(item.wish.category)}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {item.wish.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              {item.date}
                            </p>
                          </div>
                        </div>
                        {item.wish.done_comment && (
                          <p className="text-xs text-gray-500 mt-2 pl-8">
                            「{item.wish.done_comment}」
                          </p>
                        )}
                      </div>
                    );
                  }

                  if (item.type === "reward" && item.reward) {
                    return (
                      <div
                        key={`reward-${i}`}
                        className="bg-pink-50 border border-pink-200 rounded-xl p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🎁</span>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {item.reward.threshold}個達成ごほうび解放！
                            </p>
                            <p className="text-xs text-gray-500">
                              「{item.reward.content}」
                            </p>
                            <p className="text-xs text-gray-400">
                              {item.date}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
