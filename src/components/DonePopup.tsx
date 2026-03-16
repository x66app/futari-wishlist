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
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
  }, []);

  const checkReward = async () => {
    const { data: wishes } = await supabase
      .from("wishes")
      .select("id")
      .eq("status", "達成！");
    const doneCount = wishes?.length || 0;

    const { data: rewards } = await supabase
      .from("rewards")
      .select("*")
      .eq("unlocked", false)
      .lte("threshold", doneCount)
      .order("threshold", { ascending: true })
      .limit(1);

    if (rewards && rewards.length > 0) {
      const reward = rewards[0] as Reward;
      await supabase
        .from("rewards")
        .update({ unlocked: true })
        .eq("id", reward.id);
      setUnlockedReward(reward);
      setStep("reward");
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
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

  if (step === "reward" && unlockedReward) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
          <p className="text-3xl mb-3">🎁</p>
          <p className="text-lg font-bold text-gray-800 mb-2">
            ごほうび解放！
          </p>
          <p className="text-sm text-gray-600 mb-1">
            {unlockedReward.threshold}個達成の報酬：
          </p>
          <p className="text-base font-medium text-gray-800 mb-6">
            {unlockedReward.content}
          </p>
          <button
            onClick={() => setStep("done")}
            className="w-full py-3 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
          <p className="text-3xl mb-3">🎉</p>
          <p className="text-lg font-bold text-gray-800 mb-6">達成！</p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
        <p className="text-3xl mb-3">🎉</p>
        <p className="text-lg font-bold text-gray-800 mb-2">
          「{wish.title}」達成！
        </p>
        <p className="text-sm text-gray-500 mb-4">
          ひとこと残す？
        </p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="感想やメモなど"
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-gray-500 transition resize-none h-20"
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSkip}
            className="flex-1 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm hover:bg-gray-200 transition"
          >
            スキップ
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
