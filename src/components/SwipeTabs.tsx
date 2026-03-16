"use client";

import { useRef, useState, ReactNode, useEffect } from "react";
import { STATUSES } from "@/types";

type Props = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  panels: ReactNode[];
};

export default function SwipeTabs({ activeTab, onTabChange, panels }: Props) {
  const startX = useRef(0);
  const startY = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const lockedAxis = useRef<"x" | "y" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(375);

  const currentIndex = STATUSES.indexOf(activeTab as typeof STATUSES[number]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // --- 共通ロジック ---
  const onDragStart = (clientX: number, clientY: number) => {
    if (isAnimating) return;
    startX.current = clientX;
    startY.current = clientY;
    setIsDragging(true);
    setDragOffset(0);
    lockedAxis.current = null;
  };

  const onDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || isAnimating) return;

    const diffX = clientX - startX.current;
    const diffY = clientY - startY.current;

    if (!lockedAxis.current) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        lockedAxis.current = Math.abs(diffX) > Math.abs(diffY) ? "x" : "y";
      }
      return;
    }

    if (lockedAxis.current === "y") return;

    if (diffX > 0 && currentIndex === 0) {
      setDragOffset(diffX * 0.15);
      return;
    }
    if (diffX < 0 && currentIndex === STATUSES.length - 1) {
      setDragOffset(diffX * 0.15);
      return;
    }

    setDragOffset(diffX);
  };

  const onDragEnd = () => {
    if (!isDragging || isAnimating) return;
    setIsDragging(false);
    lockedAxis.current = null;

    const threshold = 60;

    if (dragOffset < -threshold && currentIndex < STATUSES.length - 1) {
      setIsAnimating(true);
      // 残りの距離をアニメーションで埋める
      setDragOffset(-containerWidth);
      setTimeout(() => {
        onTabChange(STATUSES[currentIndex + 1]);
        setDragOffset(0);
        setIsAnimating(false);
      }, 300);
    } else if (dragOffset > threshold && currentIndex > 0) {
      setIsAnimating(true);
      setDragOffset(containerWidth);
      setTimeout(() => {
        onTabChange(STATUSES[currentIndex - 1]);
        setDragOffset(0);
        setIsAnimating(false);
      }, 300);
    } else {
      setDragOffset(0);
    }
  };

  // --- タッチイベント ---
  const handleTouchStart = (e: React.TouchEvent) => {
    onDragStart(e.touches[0].clientX, e.touches[0].clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    onDragMove(e.touches[0].clientX, e.touches[0].clientY);
  };
  const handleTouchEnd = () => {
    onDragEnd();
  };

  // --- マウスイベント（PC対応）---
  const handleMouseDown = (e: React.MouseEvent) => {
    onDragStart(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    onDragMove(e.clientX, e.clientY);
  };
  const handleMouseUp = () => {
    onDragEnd();
  };
  const handleMouseLeave = () => {
    if (isDragging) onDragEnd();
  };

  // --- タブクリック ---
  const handleTabClick = (status: string) => {
    if (isAnimating) return;
    const targetIndex = STATUSES.indexOf(status as typeof STATUSES[number]);
    if (targetIndex === currentIndex) return;
    onTabChange(status);
    setDragOffset(0);
  };

  // translateX 計算
  const baseTranslateX = -(currentIndex * containerWidth);
  const translateX = baseTranslateX + dragOffset;

  // インジケーター位置
  const indicatorOffset =
    (currentIndex * 100) / STATUSES.length -
    (dragOffset / containerWidth) * (100 / STATUSES.length);

  return (
    <div>
      {/* タブヘッダー */}
      <div className="flex border-b border-gray-200 relative">
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => handleTabClick(status)}
            className={`flex-1 py-3 text-sm font-medium transition-colors duration-300 ${
              activeTab === status ? "text-gray-800" : "text-gray-400"
            }`}
          >
            {status}
          </button>
        ))}
        <div
          className="absolute bottom-0 h-0.5 bg-gray-800"
          style={{
            width: `${100 / STATUSES.length}%`,
            transform: `translateX(${indicatorOffset}%)`,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
        />
      </div>

      {/* パネルコンテナ */}
      <div
        ref={containerRef}
        className="overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div
          className="flex"
          style={{
            width: `${STATUSES.length * 100}%`,
            transform: `translateX(${translateX}px)`,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
        >
          {panels.map((panel, i) => (
            <div
              key={i}
              style={{ width: `${100 / STATUSES.length}%`, minHeight: "60vh" }}
            >
              {panel}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
