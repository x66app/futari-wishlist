export type Wish = {
  id: string;
  title: string;
  category: string;
  distance: number;
  timing: number;
  budget: number;
  motivation: number;
  status: string;
  done_date: string | null;
  done_comment: string | null;
  memo: string;
  deleted: boolean;
  created_at: string;
};

export type Reward = {
  id: string;
  threshold: number;
  content: string;
  unlocked: boolean;
  created_at: string;
};

export const CATEGORIES = [
  { icon: "🏠", label: "おうち" },
  { icon: "✈️", label: "旅行" },
  { icon: "🍽", label: "グルメ" },
  { icon: "⛰", label: "アウトドア" },
  { icon: "🎪", label: "イベント" },
  { icon: "🚶", label: "おでかけ" },
  { icon: "📦", label: "その他" },
] as const;

export const STATUSES = ["やりたい", "計画中", "達成！"] as const;

export const SLIDER_LABELS = {
  distance: { min: "自宅", max: "海外" },
  timing: { min: "今すぐ", max: "いつか" },
  budget: { min: "無料", max: "10万〜" },
  motivation: { min: "あったら", max: "絶対！" },
} as const;
