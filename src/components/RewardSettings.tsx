"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Reward } from "@/types";

type Props = {
  onClose: () => void;
};

export default function RewardSettings({ onClose }: Props) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newThreshold, setNewThreshold] = useState("");
  const [newContent, setNewContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchRewards = async () => {
    const { data } = await supabase
      .from("rewards")
      .select("*")
      .order("threshold", { ascending: true });

    if (data) {
      setRewards(data as Reward[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleAdd = async () => {
    const threshold = parseInt(newThreshold);
    if (!threshold || threshold < 1) return;
    if (!newContent.trim()) return;

    setSaving(true);
    await supabase.from("rewards").insert({
      threshold,
      content: newContent.trim(),
    });

    setNewThreshold("");
    setNewContent("");
    setShowAddForm(false);
    setSaving(false);
    fetchRewards();
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return;

    await supabase
      .from("rewards")
      .update({ content: editContent.trim() })
      .eq("id", id);

    setEditingId(null);
    setEditContent("");
    fetchRewards();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("rewards").delete().eq("id", id);
    setDeleteConfirmId(null);
    fetchRewards();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* ヘッダー */}
      <div className="bg-white pt-12 pb-4 px-4 flex items-center">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          ← 戻る
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex-1 text-center pr-8">
          🎁 ごほうび設定
        </h1>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm mt-12">読み込み中...</p>
      ) : (
        <div className="px-4 pt-4">
          {/* ごほうび一覧 */}
          {rewards.length === 0 && !showAddForm && (
            <div className="text-center mt-12">
              <p className="text-gray-400 text-sm">
                まだごほうびが設定されていないよ
              </p>
              <p className="text-gray-300 text-xs mt-2">
                達成数に応じたごほうびを追加しよう！
              </p>
            </div>
          )}

          <div className="space-y-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`rounded-xl p-4 border ${
                  reward.unlocked
                    ? "bg-pink-50 border-pink-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">
                    {reward.threshold}個達成で…
                  </span>
                  {reward.unlocked && (
                    <span className="text-xs bg-pink-200 text-pink-700 px-2 py-0.5 rounded-full">
                      解放済み！
                    </span>
                  )}
                </div>

                {editingId === reward.id ? (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full border-b-2 border-gray-300 focus:border-gray-800 outline-none bg-transparent py-1 text-sm text-gray-800"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={() => handleEdit(reward.id)}
                        className="text-xs px-3 py-1 bg-gray-800 text-white rounded-full hover:bg-gray-700"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600">
                      「{reward.content}」
                    </p>
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => {
                          setEditingId(reward.id);
                          setEditContent(reward.content);
                        }}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        編集
                      </button>
                      {deleteConfirmId === reward.id ? (
                        <button
                          onClick={() => handleDelete(reward.id)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          本当に削除する
                        </button>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(reward.id)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 追加フォーム */}
          {showAddForm ? (
            <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
              <div className="mb-4">
                <label className="text-xs text-gray-500 block mb-1">
                  何個達成で？
                </label>
                <input
                  type="number"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  placeholder="例：3"
                  min="1"
                  className="w-full border-b-2 border-gray-300 focus:border-gray-800 outline-none bg-transparent py-1 text-sm text-gray-800"
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="text-xs text-gray-500 block mb-1">
                  ごほうび内容
                </label>
                <input
                  type="text"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="例：ちょっといいランチに行く"
                  className="w-full border-b-2 border-gray-300 focus:border-gray-800 outline-none bg-transparent py-1 text-sm text-gray-800"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewThreshold("");
                    setNewContent("");
                  }}
                  className="flex-1 py-2 text-gray-400 text-sm hover:text-gray-600 transition"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="flex-1 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition disabled:opacity-50"
                >
                  {saving ? "追加中..." : "追加する"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:border-gray-400 hover:text-gray-500 transition"
            >
              ＋ ごほうびを追加
            </button>
          )}
        </div>
      )}
    </div>
  );
}
