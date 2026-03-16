"use client";

import { useRef, useState, ReactNode, useEffect } from "react";
import { STATUSES } from "@/types";

type Props = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  panels: ReactNode[];
  swipeEnabled?: boolean;
};

export default function SwipeTabs({ activeTab, onTabChange, panels, swipeEnabled = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const lockedAxis = useRef<"x" | "y" | null>(null);
  const isMouseDown = useRef(false);

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

  const currentIndex = STATUSES.indexOf(activeTab as (typeof STATUSES)[number]);

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!swipeEnabled || isAnimating) return;
    startX.current = clientX;
    startY.current = clientY;
    lockedAxis.current = null;
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!swipeEnabled || !isDragging || isAnimating) return;

    const diffX = clientX - startX.current;
    const diffY = clientY - startY.current;

    if (!lockedAxis.current) {
      if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
        lockedAxis.current = Math.abs(diffX) > Math.abs(diffY) ? "x" : "y";
      }
      return;
    }

    if (lockedAxis.current === "y") return;

    // 端のタブでは動かさない
    if (currentIndex === 0 && diffX > 0) {
      setDragOffset(0);
      return;
    }
    if (currentIndex === STATUSES.length - 1 && diffX < 0) {
      setDragOffset(0);
      return;
    }

    setDragOffset(diffX);
  };

  const handleDragEnd = () => {
    if (!swipeEnabled || !isDragging) return;
    setIsDragging(false);

    const threshold = 60;
    if (lockedAxis.current === "x") {
      if (dragOffset < -threshold && currentIndex < STATUSES.length - 1) {
        setIsAnimating(true);
        setDragOffset(-containerWidth);
        setTimeout(() => {
          onTabChange(STATUSES[currentIndex + 1]);
          setDragOffset(0);
          setIsAnimating(false);
        }, 250);
        return;
      } else if (dragOffset > threshold && currentIndex > 0) {
        setIsAnimating(true);
        setDragOffset(containerWidth);
        setTimeout(() => {
          onTabChange(STATUSES[currentIndex - 1]);
          setDragOffset(0);
          setIsAnimating(false);
        }, 250);
        return;
      }
    }

    if (dragOffset !== 0) {
      setIsAnimating(true);
      setDragOffset(0);
      setTimeout(() => setIsAnimating(false), 250);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
  };
  const handleTouchEnd = () => handleDragEnd();

  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDown.current = true;
    handleDragStart(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current) return;
    handleDragMove(e.clientX, e.clientY);
  };
  const handleMouseUp = () => {
    isMouseDown.current = false;
    handleDragEnd();
  };
  const handleMouseLeave = () => {
    if (isMouseDown.current) {
      isMouseDown.current = false;
      handleDragEnd();
    }
  };

  const handleTabClick = (tab: string) => {
    if (isAnimating) return;
    const targetIndex = STATUSES.indexOf(tab as (typeof STATUSES)[number]);
    if (targetIndex === currentIndex) return;

    setIsAnimating(true);
    setDragOffset(targetIndex > currentIndex ? -containerWidth : containerWidth);
    setTimeout(() => {
      onTabChange(tab);
      setDragOffset(0);
      setIsAnimating(false);
    }, 250);
  };

  const baseTranslate = -currentIndex * containerWidth;
  const totalTranslate = baseTranslate + dragOffset;

  return (
    <div>
      {/* タブヘッダー */}
      <div className="flex border-b border-gray-200 relative">
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => handleTabClick(status)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === status ? "text-gray-800" : "text-gray-400"
            }`}
          >
            {status}
          </button>
        ))}
        <div
          className="absolute bottom-0 h-0.5 bg-gray-800 transition-all duration-250"
          style={{
            width: `${100 / STATUSES.length}%`,
            transform: `translateX(${
              currentIndex * 100 + (containerWidth ? (-dragOffset / containerWidth) * -100 : 0)
            }%)`,
            transitionProperty: isAnimating ? "transform" : "none",
          }}
        />
      </div>

      {/* スワイプ検知エリア */}
      <div
        ref={containerRef}
        className="overflow-hidden min-h-[60vh]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(${totalTranslate}px)`,
            transition: isAnimating ? "transform 250ms ease-out" : "none",
          }}
        >
          {panels.map((panel, i) => (
            <div
              key={i}
              style={{ minWidth: containerWidth || "100%", width: containerWidth || "100%" }}
            >
              {panel}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
