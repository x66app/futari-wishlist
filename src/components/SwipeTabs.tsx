"use client";

import { useState, useRef, TouchEvent } from "react";
import { STATUSES } from "@/types";

type Props = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export default function SwipeTabs({ activeTab, onTabChange }: Props) {
  const touchStartX = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    const currentIndex = STATUSES.indexOf(activeTab as typeof STATUSES[number]);

    if (diff > 50 && currentIndex < STATUSES.length - 1) {
      onTabChange(STATUSES[currentIndex + 1]);
    } else if (diff < -50 && currentIndex > 0) {
      onTabChange(STATUSES[currentIndex - 1]);
    }
  };

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="flex border-b border-gray-200">
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => onTabChange(status)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === status
                ? "text-gray-800 border-b-2 border-gray-800"
                : "text-gray-400"
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
}
