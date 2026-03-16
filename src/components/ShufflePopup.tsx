"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Wish, CATEGORIES } from "@/types";
import { supabase } from "@/lib/supabase";

type Props = {
  wishes: Wish[];
  onAccept: () => void;
  onClose: () => void;
};

function getCategoryIcon(category: string): string {
  const found = CATEGORIES.find((c) => c.label === category);
  return found ? found.icon : "📦";
}

function renderStars(motivation: number): string {
  return "★".repeat(motivation) + "☆".repeat(5 - motivation);
}

function pickResult(wishes: Wish[]): Wish {
  const sorted = [...wishes].sort((a, b) => b.motivation - a.motivation);
  const topMotivation = sorted[0].motivation;
  const topCandidates = sorted.filter((w) => w.motivation === topMotivation);
  return topCandidates[Math.floor(Math.random() * topCandidates.length)];
}

export default function ShufflePopup({ wishes, onAccept, onClose }: Props) {
  const [displayWish, setDisplayWish] = useState<Wish>(wishes[0]);
  const [spinning, setSpinning] = useState(true);
  const [finalWish, setFinalWish] = useState<Wish | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startSpin = useCallback(() => {
    const result = pickResult(wishes);
    setFinalWish(result);
    setSpinning(true);

    let speed = 80;
    let count = 0;
    const maxCount = wishes.length === 1 ? 5 : 15;

    const spin = () => {
      timeoutRef.current = setTimeout(() => {
        if (wishes.length > 1) {
          const randomIndex = Math.floor(Math.random() * wishes.length);
          setDisplayWish(wishes[randomIndex]);
        }
        count++;

        if (count >= maxCount) {
          setDisplayWish(result);
          setSpinning(false);
          return;
        }

        speed += 30;
        spin();
      }, speed);
    };

    spin();
  }, [wishes]);

  useEffect(() => {
    startSpin();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleAccept = async () => {
    if (!finalWish) return;
    await supabase
      .from("wishes")
      .update({ status: "計画中" })
      .eq("id", finalWish.id);
    onAccept();
  };

  const handleRetry = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    startSpin();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
        <p className="text-sm text-gray-500 mb-4">
          {spinning ? "ピピピピピ..." : "次はこれ、やる？"}
        </p>

        <div
          className={`bg-gray-50 rounded-xl p-4 mb-4 transition-all ${
            spinning ? "opacity-70 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <span className="text-2xl">
            {getCategoryIcon(displayWish.category)}
          </span>
          <p className="font-medium text-gray-800 mt-2">
            {displayWish.title}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {displayWish.category}
          </p>
          <p className="text-xs text-yellow-500 mt-1">
            {renderStars(displayWish.motivation)}
          </p>
        </div>

        {!spinning && (
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 py-2 text-gray-400 text-sm hover:text-gray-600 active:text-gray-800 transition"
            >
              もう1回
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 text-gray-400 text-sm hover:text-gray-600 active:text-gray-800 transition"
            >
              やめとく
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 active:bg-gray-600 transition"
            >
              やるか！
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
