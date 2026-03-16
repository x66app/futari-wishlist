"use client";

import { useState, useEffect } from "react";
import { Wish, Reward } from "@/types";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

type Props = {
  wish: Wish;
  onClose: () => void;
};

export default function DonePopup({ wish, onClose }: Props) {
  const [comment, setComment] = useState("");
  const [step, setStep] = useState<"comment" | "reward" | "done">("comment");
  const [unlockedReward, setUnlockedReward] = useState<Reward | null>(null);

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  const checkReward = async () => {
    // 達成数を取得
    const { data: doneWishes } = await supabase
      .from("wishes")
      .select("id")
      .eq("status", "達成！");

    const doneCount = doneWishes?.length || 0;

    // 未解放のごほうびで条件を満たすものを探す
    const { data: rewards } = await supabase
      .from("rewards")
      .select("*")
      .eq("unlocked", false)
      .lte("threshold", doneCount)
      .order("threshold", { ascending: true })
      .limit(1);

    if (rewards && rewards.length > 0) {
      const reward = rewards[0] as Reward;
      // 解放済みにする
      await supabase
        .from("rewards")
        .update({ unlocked: true })
        .eq("id", reward.id);

      setUnlockedReward(reward);
      setStep("reward");
    } else {
      setStep("done");
    }
  };

  const handleSave = async () => {
    if (comment.trim()) {
      await supabase
        .from("wishes")
        .update({ done_comment: comment.trim() })
        .eq("id", wish.id);
    }
    await checkReward();
  };

  const handleSkip = async () => {
    await checkReward();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
        {step === "comment" && (
          <>
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-lg font-bold text-gray-800 mb-1">
              達成おめでとう！
            </p>
            <p className="text-sm text-gray-500 mb-4">
              「{wish.title}」
            </p>
            <p className="text-xs text-gray-400 mb-3">
              ひとこと残す？（スキップOK）
            </p>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="例：最高だった！"
              className="w-full border-b-2 border-gray-300 focus:border-gray-800 outline-none bg-transparent py-2 text-gray-800 text-center mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-2 text-gray-400 text-sm hover:text-gray-600 transition"
              >
                スキップ
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition"
              >
                残す！
              </button>
            </div>
          </>
        )}

        {step === "reward" && unlockedReward && (
          <>
            <p className="text-4xl mb-3">🎁</p>
            <p className="text-lg font-bold text-gray-800 mb-1">
              {unlockedReward.threshold}個達成おめでとう！
            </p>
            <p className="text-sm text-gray-500 mb-2">ごほうび解放！</p>
            <div className="bg-pink-50 rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-gray-800">
                「{unlockedReward.content}」
              </p>
            </div>
            <button
              onClick={() => {
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 },
                });
                setStep("done");
              }}
              className="px-6 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition"
            >
              やったー！
            </button>
          </>
        )}

        {step === "done" && (
          <>
            <p className="text-4xl mb-3">✨</p>
            <p className="text-lg font-bold text-gray-800 mb-2">
              ふたりの思い出がまた1つ増えたよ！
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition"
            >
              OK！
            </button>
          </>
        )}
      </div>
    </div>
  );
}
