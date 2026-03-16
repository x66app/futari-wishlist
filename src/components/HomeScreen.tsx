"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Wish, STATUSES, CATEGORIES } from "@/types";
import ProgressBar from "./ProgressBar";
import SwipeTabs from "./SwipeTabs";
import WishCard from "./WishCard";
import WishCardExpanded from "./WishCardExpanded";
import AddWishForm from "./AddWishForm";
import DonePopup from "./DonePopup";
import SuggestPopup from "./SuggestPopup";
import ShufflePopup from "./ShufflePopup";
import SeasonPopup from "./SeasonPopup";
import FilterPanel, {
  FilterState,
  DEFAULT_FILTER,
  isFilterActive,
} from "./FilterPanel";
import Timeline from "./Timeline";
import RewardSettings from "./RewardSettings";

const SORT_OPTIONS = [
  { key: "motivation_desc", label: "モチベ高い順" },
  { key: "motivation_asc", label: "モチベ低い順" },
  { key: "created_desc", label: "新しい順" },
  { key: "created_asc", label: "古い順" },
  { key: "budget_asc", label: "予算低い順" },
  { key: "budget_desc", label: "予算高い順" },
];

function applySortToList(list: Wish[], key: string): Wish[] {
  const sorted = [...list];
  switch (key) {
    case "motivation_desc":
      return sorted.sort((a, b) => b.motivation - a.motivation);
    case "motivation_asc":
      return sorted.sort((a, b) => a.motivation - b.motivation);
    case "created_desc":
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case "created_asc":
      return sorted.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case "budget_asc":
      return sorted.sort((a, b) => a.budget - b.budget);
    case "budget_desc":
      return sorted.sort((a, b) => b.budget - a.budget);
    default:
      return sorted;
  }
}

function applyFilter(list: Wish[], f: FilterState): Wish[] {
  return list.filter((w) => {
    if (f.category !== "全部" && w.category !== f.category) return false;
    if (w.distance > f.distanceMax) return false;
    if (w.timing > f.timingMax) return false;
    if (w.budget > f.budgetMax) return false;
    if (w.motivation < f.motivationMin) return false;
    return true;
  });
}

function pickSuggestion(wishes: Wish[], doneWish: Wish): Wish | null {
  const candidates = wishes.filter(
    (w) => w.status === "やりたい" && w.id !== doneWish.id
  );
  if (candidates.length === 0) return null;
  const diffCategory = candidates.filter((c) => c.category !== doneWish.category);
  const pool = diffCategory.length > 0 ? diffCategory : candidates;
  const sorted = [...pool].sort((a, b) => b.motivation - a.motivation);
  const topMotivation = sorted[0].motivation;
  const top = sorted.filter((w) => w.motivation === topMotivation);
  return top[Math.floor(Math.random() * top.length)];
}

export default function HomeScreen() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [activeTab, setActiveTab] = useState("やりたい");
  const [selectedWishId, setSelectedWishId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showShuffle, setShowShuffle] = useState(false);
  const [showSeason, setShowSeason] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [sortKey, setSortKey] = useState("motivation_desc");
  const filterActive = isFilterActive(filter);

  const [doneWish, setDoneWish] = useState<Wish | null>(null);
  const [suggestWish, setSuggestWish] = useState<Wish | null>(null);

  const fetchWishes = async () => {
    const { data } = await supabase
      .from("wishes")
      .select("*")
      .order("motivation", { ascending: false });
    if (data) setWishes(data as Wish[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  const handleUpdate = () => {
    fetchWishes();
    setSelectedWishId(null);
  };

  const handleDone = (wish: Wish) => {
    setDoneWish(wish);
    setSelectedWishId(null);
    fetchWishes();
  };

  const handleDonePopupClose = () => {
    const suggestion = doneWish ? pickSuggestion(wishes, doneWish) : null;
    setDoneWish(null);
    if (suggestion) setSuggestWish(suggestion);
  };

  const handleSuggestAccept = () => {
    setSuggestWish(null);
    fetchWishes();
  };

  const handleSuggestSkip = () => {
    setSuggestWish(null);
  };

  const renderCardList = (status: string) => {
    const statusWishes = wishes.filter((w) => w.status === status);
    const filtered = applyFilter(statusWishes, filter);
    const sorted = applySortToList(filtered, sortKey);

    if (sorted.length === 0) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-400 text-sm">
            {status === "やりたい" && (filterActive ? "該当なし" : "＋から追加しよう")}
            {status === "計画中" && "まだなし"}
            {status === "達成！" && "これから！"}
          </p>
        </div>
      );
    }

    return (
      <div className="pt-3 pb-4">
        {sorted.map((w) =>
          selectedWishId === w.id ? (
            <WishCardExpanded
              key={w.id}
              wish={w}
              onUpdate={handleUpdate}
              onDone={handleDone}
              onClose={() => setSelectedWishId(null)}
            />
          ) : (
            <WishCard
              key={w.id}
              wish={w}
              onClick={() =>
                setSelectedWishId(selectedWishId === w.id ? null : w.id)
              }
            />
          )
        )}
      </div>
    );
  };

  const shuffleCandidates = wishes.filter((w) => w.status === "やりたい");
  const isCardExpanded = selectedWishId !== null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <AddWishForm
        onAdded={() => { setShowAddForm(false); fetchWishes(); }}
        onClose={() => setShowAddForm(false)}
      />
    );
  }

  if (showTimeline) {
    return <Timeline onClose={() => setShowTimeline(false)} />;
  }

  if (showRewards) {
    return <RewardSettings onClose={() => setShowRewards(false)} />;
  }

  const doneCount = wishes.filter((w) => w.status === "達成！").length;

  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      {/* ヘッダー（タイトにした） */}
      <div className="bg-white pt-8 pb-1 px-4">
        <h1 className="text-base font-bold text-gray-800 text-center">
          Wishboard
        </h1>
      </div>

      {/* プログレスバー */}
      <div className="bg-white">
        <ProgressBar done={doneCount} total={wishes.length} />
      </div>

      {/* シャッフル & 季節ボタン */}
      <div className="bg-white px-4 pb-2 flex gap-2">
        <button
          onClick={() => shuffleCandidates.length > 0 && setShowShuffle(true)}
          className={`flex-1 py-2 rounded-lg text-sm transition ${
            shuffleCandidates.length > 0
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "bg-gray-50 text-gray-300 cursor-not-allowed"
          }`}
        >
          🎲 シャッフル
        </button>
        <button
          onClick={() => setShowSeason(true)}
          className="flex-1 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition"
        >
          🗓 おすすめ
        </button>
      </div>

      {/* フィルター & ソート */}
      <div className="bg-white px-4 pb-2 flex gap-2 items-center">
        <button
          onClick={() => { setShowFilter(!showFilter); setShowSort(false); }}
          className={`px-3 py-1.5 rounded-full text-xs transition ${
            filterActive ? "bg-gray-800 text-white" : "text-gray-500 bg-gray-100"
          }`}
        >
          🔽 絞り込み{filterActive && "中"}
        </button>
        <div className="relative">
          <button
            onClick={() => { setShowSort(!showSort); setShowFilter(false); }}
            className="px-3 py-1.5 rounded-full text-xs bg-gray-100 text-gray-500 transition hover:bg-gray-200"
          >
            ↕️ {SORT_OPTIONS.find((o) => o.key === sortKey)?.label}
          </button>
          {showSort && (
            <div className="absolute top-10 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 min-w-[160px]">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { setSortKey(opt.key); setShowSort(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm transition ${
                    sortKey === opt.key
                      ? "bg-gray-100 font-medium text-gray-800"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* フィルターパネル */}
      {showFilter && (
        <FilterPanel
          filter={filter}
          onApply={(f) => { setFilter(f); setShowFilter(false); }}
          onClose={() => setShowFilter(false)}
        />
      )}

      {/* タブ & カードリスト */}
      <div className="bg-white sticky top-0 z-10">
        <SwipeTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          panels={STATUSES.map((status) => renderCardList(status))}
          swipeEnabled={!isCardExpanded}
        />
      </div>

      {/* 追加ボタン */}
      <div className="fixed bottom-16 right-4 z-20">
        <button
          onClick={() => setShowAddForm(true)}
          className="w-14 h-14 bg-gray-800 text-white rounded-full shadow-lg text-2xl flex items-center justify-center hover:bg-gray-700 transition"
        >
          ＋
        </button>
      </div>

      {/* フッター */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10">
        <button
          onClick={() => setShowTimeline(true)}
          className="flex-1 py-3 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          📅 タイムライン
        </button>
        <button
          onClick={() => setShowRewards(true)}
          className="flex-1 py-3 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          🎁 ごほうび
        </button>
      </div>

      {/* ポップアップ類 */}
      {showShuffle && (
        <ShufflePopup
          wishes={shuffleCandidates}
          onAccept={() => { setShowShuffle(false); fetchWishes(); }}
          onClose={() => setShowShuffle(false)}
        />
      )}

      {showSeason && (
        <SeasonPopup
          wishes={wishes}
          onUpdate={() => fetchWishes()}
          onClose={() => setShowSeason(false)}
        />
      )}

      {doneWish && (
        <DonePopup wish={doneWish} onClose={handleDonePopupClose} />
      )}

      {suggestWish && (
        <SuggestPopup
          wish={suggestWish}
          onAccept={handleSuggestAccept}
          onSkip={handleSuggestSkip}
        />
      )}
    </div>
  );
}
