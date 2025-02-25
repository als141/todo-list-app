// frontend/src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * クラス名をマージするユーティリティ関数
 * clsxとtailwind-mergeを組み合わせてTailwindのクラス名の競合を解決する
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 日付をフォーマットする関数
 * @param date 日付オブジェクトまたは日付文字列
 * @param includeTime 時間を含めるかどうか
 */
export function formatDate(date: Date | string | undefined, includeTime = false): string {
  if (!date) return "";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  
  if (!includeTime) {
    return `${year}/${month}/${day}`;
  }
  
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

/**
 * オブジェクトから空の値を除外する
 * @param obj 元のオブジェクト
 */
export function removeEmptyValues<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => {
      if (value === null || value === undefined || value === "") return false;
      return true;
    })
  ) as Partial<T>;
}

/**
 * カラーコードを明るくする
 * @param hex カラーコード
 * @param percent 明るくする割合
 */
export function lightenColor(hex: string, percent: number): string {
  // #を除去
  hex = hex.replace("#", "");
  
  // R, G, Bに分解
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // 明るくする
  const lightenValue = (value: number): number => {
    return Math.min(255, Math.floor(value + (255 - value) * (percent / 100)));
  };
  
  // 16進数に変換して戻す
  const rStr = lightenValue(r).toString(16).padStart(2, "0");
  const gStr = lightenValue(g).toString(16).padStart(2, "0");
  const bStr = lightenValue(b).toString(16).padStart(2, "0");
  
  return `#${rStr}${gStr}${bStr}`;
}

/**
 * プライオリティのラベルを取得
 * @param priority プライオリティ
 */
export function getPriorityLabel(priority: string): string {
  switch (priority) {
    case "low":
      return "低";
    case "medium":
      return "中";
    case "high":
      return "高";
    case "urgent":
      return "緊急";
    default:
      return "中";
  }
}