export type Wish = {
  id: string
  title: string
  category: string
  distance: number
  timing: number
  budget: number
  motivation: number
  status: 'やりたい' | '計画中' | '達成！'
  done_date: string | null
  done_comment: string | null
  created_at: string
}

export type Reward = {
  id: string
  threshold: number
  content: string
  unlocked: boolean
  created_at: string
}

export const CATEGORIES = [
  { icon: '🏠', label: 'おうち' },
  { icon: '✈️', label: '旅行' },
  { icon: '🍽', label: 'グルメ' },
  { icon: '⛰', label: 'アウトドア' },
  { icon: '🎪', label: 'イベント' },
  { icon: '📦', label: 'その他' },
] as const

export const STATUSES = ['やりたい', '計画中', '達成！'] as const

export const SLIDER_LABELS = {
  distance: { min: '近い', max: '遠い' },
  timing: { min: 'すぐ', max: 'いつか' },
  budget: { min: '安い', max: '高い' },
  motivation: { min: 'まあまあ', max: 'めっちゃ' },
} as const
