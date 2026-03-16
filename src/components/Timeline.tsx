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

function getCategoryIcon(category: string) {
  const found = CATEGORIES.find((c) => c.label === category);
  return found ? found.icon : "📦";
}

function groupByMonth(items: TimelineItem[]): Record<string, TimelineItem[]> {
  const groups: Record<string, TimelineItem[]> = {};
  items.forEach((item) => {
    const d = new Date(item.date);
    const key = `${d.getFullYear()}年${d.getMonth() + 1}月`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
}

export default function Timeline({ onClose }: Props) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
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

      const timeline: TimelineItem[] = [];

      (wishes || []).forEach((w: Wish) => {
        timeline.push({ type: "wish", date: w.done_date!, wish: w });
      });

      (rewards || []).forEach((r: Reward) => {
        timeline.push({
          type: "reward",
          date: r.created_at,
          reward: r,
        });
      });

      timeline.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setItems(timeline);
      setLoading(false);
    };
    fetch();
  }, []);

  const grouped = groupByMonth(items);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white pt-12 pb-3 px-4 flex items-center">
        <button
          onClick={onClose}
          className="text-gray-400 text-sm hover:text-gray-600 transition"
        >
          ← 戻る
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-800 pr-8">
          タイムライン
        </h1>
      </div>

      <div className="px-4 pt-4 pb-8">
        {loading ? (
          <p className="text-gray-400 text-center mt-12">読み込み中...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-400 text-center mt-12">
            まだ達成したものがないよ
          </p>
        ) : (
          Object.entries(grouped).map(([month, entries]) => (
            <div key={month} className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-2">
                {month}
              </p>
              <div className="space-y-2">
                {entries.map((item, i) =>
                  item.type === "wish" && item.wish ? (
                    <div
                      key={`w-${i}`}
                      className="bg-white p-3 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getCategoryIcon(item.wish.category)}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {item.wish.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {item.wish.done_date}
                          </p>
                        </div>
                      </div>
                      {item.wish.done_comment && (
                        <p className="text-xs text-gray-500 mt-2 pl-8">
                          「{item.wish.done_comment}」
                        </p>
                      )}
                    </div>
                  ) : item.type === "reward" && item.reward ? (
                    <div
                      key={`r-${i}`}
                      className="bg-yellow-50 p-3 rounded-xl border border-yellow-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎁</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {item.reward.content}
                          </p>
                          <p className="text-xs text-gray-400">
                            {item.reward.threshold}個達成で解放
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
