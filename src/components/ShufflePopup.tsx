"use client";

import { useState, useEffect, useRef } from "react";
import { Wish, CATEGORIES } from "@/types";
import { supabase } from "@/lib/supabase";

type Props = {
  wishes: Wish[];
  onAccept: () => void;
  onClose: () => void;
};

function getCategoryIcon(category: string) {
  const found = CATEGORIES.find((c) => c.label === category);
  return found ? found.icon : "📦";
}

function renderStars(motivation: number) {
  return "★".repeat(motivation) + "☆".repeat(5 - motivation);
}

function pickRandom(wishes: Wish[]): Wish {
  return wishes[Math.floor(Math.random() * wishes.length)];
}

export default function ShufflePopup({ wishes, onAccept, onClose }: Props) {
  const [displayWish, setDisplayWish] = useState<Wish>(wishes[0]);
  const [spinning, setSpinning] = useState(true);
  const [finalWish, setFinalWish] = useState<Wish | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startSpin = () => {
    setSpinning(true);
    setFinalWish(null);

    // 完全ランダムに1つ選ぶ
    const result = pickRandom(wishes);

    let speed = 80;
    let count = 0;
    const maxCount = wishes.length === 1 ? 5 : 15;

    const spin = () => {
      timeoutRef.current = setTimeout(() => {
        setDisplayWish(pickRandom(wishes));
        count++;
        if (count >= maxCount) {
          setDisplayWish(result);
          setFinalWish(result);
          setSpinning(false);
          return;
        }
        speed += 30;
        spin();
      }, speed);
    };
    spin();
  };

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
          {spinning ? "選んでます..." : "これはどう？"}
        </p>
        <div
          className={`transition-all duration-200 ${
            spinning ? "scale-95 opacity-70" : "scale-100 opacity-100"
          }`}
        >
          <p className="text-3xl mb-2">
            {getCategoryIcon(displayWish.category)}
          </p>
          <p className="text-lg font-bold text-gray-800 mb-1">
            {displayWish.title}
          </p>
          <p className="text-xs text-gray-400 mb-1">
            {displayWish.category}
          </p>
          <p className="text-xs text-yellow-500 tracking-wider">
            {renderStars(displayWish.motivation)}
          </p>
        </div>

        {!spinning && (
          <div className="flex gap-2 mt-6">
            <button
              onClick={handleRetry}
              className="flex-1 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm hover:bg-gray-200 transition"
            >
              もう1回
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm hover:bg-gray-200 transition"
            >
              やめとく
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 py-2 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition"
            >
              やるか！
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
