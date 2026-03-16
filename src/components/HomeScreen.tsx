"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Wish } from "@/types";
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

function pickSuggestion(wishes: Wish[], doneWish: Wish): Wish | null {
  const candidates = wishes.filter(
    (w) => w.status === "やりたい" && w.id !== doneWish.id
  );
  if (candidates.length === 0) return null;

  const diffCategory = candidates.filter(
    (w) => w.category !== doneWish.category
  );
  const pool = diffCategory.length > 0 ? diffCategory : candidates;

  const sorted = [...pool].sort((a, b) => b.motivation - a.motivation);
  const topMotivation = sorted[0].motivation;
  const topCandidates = sorted.filter(
    (w) => w.motivation === topMotivation
  );

  return topCandidates[Math.floor(Math.random() * topCandidates.length)];
}

function applyFilter(wishes: Wish[], filter: FilterState): Wish[] {
  return wishes.filter((w) => {
    if (filter.category !== "全部" && w.category !== filter.category)
      return false;
    if (w.distance > filter.distanceMax) return false;
    if (w.timing > filter.timingMax) return false;
    if (w.budget > filter.budgetMax) return false;
    if (w.motivation < filter.motivationMin) return false;
    return true;
  });
}

export default function HomeScreen() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [activeTab, setActiveTab] = useState("やりたい");
  const [selectedWishId, setSelectedWishId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [doneWish, setDoneWish] = useState<Wish | null>(null);
  const [suggestWish, setSuggestWish] = useState<Wish | null>(null);
  const [showShuffle, setShowShuffle] = useState(false);
  const [showSeason, setShowSeason] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  const fetchWishes = async () => {
    const { data } = await supabase
      .from("wishes")
      .select("*")
      .order("motivation", { ascending: false });

    if (data) {
      setWishes(data as Wish[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  const handleUpdate = () => {
    setSelectedWishId(null);
    fetchWishes();
  };

  const handleDone = (wish: Wish) => {
    setSelectedWishId(null);
    setDoneWish(wish);
    fetchWishes();
  };

  const handleDonePopupClose = () => {
    const suggestion = pickSuggestion(wishes, doneWish!);
    setDoneWish(null);
    if (suggestion) {
      setSuggestWish(suggestion);
    }
  };

  const handleSuggestAccept = () => {
    setSuggestWish(null);
    fetchWishes();
  };

  const handleSuggestSkip = () => {
    setSuggestWish(null);
  };

  const handleAdded = () => {
    setShowAddForm(false);
    fetchWishes();
  };

  const handleShuffleAccept = () => {
    setShowShuffle(false);
    fetchWishes();
  };

  const handleSeasonUpdate = () => {
    fetchWishes();
  };

  const shuffleCandidates = wishes.filter((w) => w.status === "やりたい");

  const tabWishes = wishes.filter((w) => w.status === activeTab);
  const filteredWishes = applyFilter(tabWishes, filter);
  const doneCount = wishes.filter((w) => w.status === "達成！").length;
  const filterActive = isFilterActive(filter);

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
        onClose={() => setShowAddForm(false)}
        onAdded={handleAdded}
      />
    );
  }

  if (showTimeline) {
    return <Timeline onClose={() => setShowTimeline(false)} />;
  }

  if (showRewards) {
    return <RewardSettings onClose={() => setShowRewards(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ヘッダー */}
      <div className="bg-white pt-12 pb-2 px-4">
        <h1 className="text-lg font-bold text-gray-800 text-center">
          ふたりのやりたいこと
        </h1>
      </div>

      {/* プログレスバー */}
      <div className="bg-white">
        <ProgressBar done={doneCount} total={wishes.length} />
      </div>

      {/* シャッフル・季節ボタン */}
      <div className="bg-white px-4 pb-3 flex gap-2">
        <button
          onClick={() => {
            if (shuffleCandidates.length > 0) setShowShuffle(true);
          }}
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
          🗓 季節のおすすめ
        </button>
      </div>

      {/* タブ */}
      <div className="bg-white sticky top-0 z-10">
        <SwipeTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* フィルターボタン */}
      <div className="flex justify-end px-4 pt-2">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`text-xs px-3 py-1 rounded-full transition ${
            filterActive
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {showFilter ? "🔼 絞り込み" : "🔽 絞り込み"}
          {filterActive && !showFilter && " 🔵"}
        </button>
      </div>

      {/* フィルターパネル */}
      {showFilter && (
        <FilterPanel
          filter={filter}
          onApply={setFilter}
          onClose={() => setShowFilter(false)}
        />
      )}

      {/* フィルター適用中の表示 */}
      {filterActive && !showFilter && (
        <p className="text-xs text-gray-400 text-center mb-1">
          絞り込み中
        </p>
      )}

      {/* カードリスト */}
      <div className="pt-1">
        {filteredWishes.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-12">
            {filterActive
              ? "条件に合うものがないよ"
              : activeTab === "やりたい"
              ? "やりたいことを追加しよう！"
              : activeTab === "計画中"
              ? "まだ計画中のものはないよ"
              : "達成したらここに表示されるよ！"}
          </p>
        ) : (
          filteredWishes.map((wish) =>
            selectedWishId === wish.id ? (
              <WishCardExpanded
                key={wish.id}
                wish={wish}
                onUpdate={handleUpdate}
                onClose={() => setSelectedWishId(null)}
                onDone={handleDone}
              />
            ) : (
              <WishCard
                key={wish.id}
                wish={wish}
                onClick={() => setSelectedWishId(wish.id)}
              />
            )
          )
        )}
      </div>

      {/* 追加ボタン */}
      <div className="fixed bottom-12 right-4 z-20">
        <button
          onClick={() => setShowAddForm(true)}
          className="w-14 h-14 bg-gray-800 text-white rounded-full shadow-lg text-2xl hover:bg-gray-700 transition flex items-center justify-center"
        >
          ＋
        </button>
      </div>

      {/* フッター */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10">
        <button
          onClick={() => setShowTimeline(true)}
          className="flex-1 py-3 text-xs text-gray-500 hover:text-gray-800 transition"
        >
          📅 タイムライン
        </button>
        <button
          onClick={() => setShowRewards(true)}
          className="flex-1 py-3 text-xs text-gray-500 hover:text-gray-800 transition"
        >
          🎁 ごほうび
        </button>
      </div>

      {/* 達成ポップアップ */}
      {doneWish && (
        <DonePopup wish={doneWish} onClose={handleDonePopupClose} />
      )}

      {/* 提案ポップアップ */}
      {suggestWish && (
        <SuggestPopup
          wish={suggestWish}
          onAccept={handleSuggestAccept}
          onSkip={handleSuggestSkip}
        />
      )}

      {/* シャッフルポップアップ */}
      {showShuffle && (
        <ShufflePopup
          wishes={shuffleCandidates}
          onAccept={handleShuffleAccept}
          onClose={() => setShowShuffle(false)}
        />
      )}

      {/* 季節のおすすめポップアップ */}
      {showSeason && (
        <SeasonPopup
          wishes={wishes}
          onUpdate={handleSeasonUpdate}
          onClose={() => setShowSeason(false)}
        />
      )}
    </div>
  );
}
