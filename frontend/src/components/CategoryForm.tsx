// frontend/src/components/CategoryForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Category } from "@/types";

interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (data: { name: string; color: string }) => void;
  onCancel?: () => void;
}

// プリセットカラー
const PRESET_COLORS = [
  "#EF4444", // 赤
  "#F59E0B", // オレンジ
  "#10B981", // 緑
  "#3B82F6", // 青
  "#8B5CF6", // 紫
  "#EC4899", // ピンク
  "#6B7280", // グレー
  "#000000", // 黒
];

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: initialData?.name || "",
      color: initialData?.color || "#3B82F6", // デフォルトは青
    },
  });

  const selectedColor = watch("color");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">カテゴリ名 <span className="text-red-500">*</span></Label>
        <Input
          id="name"
          placeholder="カテゴリ名を入力"
          {...register("name", { required: "カテゴリ名は必須です" })}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>カラー</Label>
        <div className="grid grid-cols-8 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                selectedColor === color
                  ? "ring-2 ring-primary ring-offset-2"
                  : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setValue("color", color)}
            />
          ))}
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <div
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: selectedColor }}
          />
          <Input
            type="text"
            id="color"
            {...register("color", {
              required: "カラーは必須です",
              pattern: {
                value: /^#[0-9A-F]{6}$/i,
                message: "有効なカラーコードを入力してください (例: #3B82F6)",
              },
            })}
          />
        </div>
        {errors.color && (
          <p className="text-sm text-red-500">{errors.color.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
        )}
        <Button type="submit">
          {initialData ? "更新する" : "作成する"}
        </Button>
      </div>
    </form>
  );
};