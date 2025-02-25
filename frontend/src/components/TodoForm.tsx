// frontend/src/components/TodoForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Todo, Category, Priority } from '@/types';

type TodoFormData = {
  task: string;
  description?: string;
  priority: Priority;
  due_date?: Date | null;
  category_id?: number | null;
};

interface TodoFormProps {
  initialData?: Todo;
  categories: Category[];
  onSubmit: (data: TodoFormData) => void;
  onCancel?: () => void;
}

export const TodoForm: React.FC<TodoFormProps> = ({
  initialData,
  categories,
  onSubmit,
  onCancel
}) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TodoFormData>({
    defaultValues: {
      task: initialData?.task || '',
      description: initialData?.description || '',
      priority: initialData?.priority || Priority.MEDIUM,
      due_date: initialData?.due_date ? new Date(initialData.due_date) : undefined,
      category_id: initialData?.category_id
    }
  });

  const [date, setDate] = useState<Date | undefined>(
    initialData?.due_date ? new Date(initialData.due_date) : undefined
  );

  // 日付が変更されたらフォームにも反映
  useEffect(() => {
    setValue('due_date', date);
  }, [date, setValue]);

  // フォームの値をウォッチ
  const watchedValues = watch();

  // フォームをリセット
  const handleReset = () => {
    reset();
    setDate(undefined);
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task">タスク名 <span className="text-red-500">*</span></Label>
        <Input
          id="task"
          placeholder="タスクを入力してください"
          {...register('task', { required: 'タスク名は必須です' })}
          className={errors.task ? 'border-red-500' : ''}
        />
        {errors.task && (
          <p className="text-sm text-red-500">{errors.task.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">詳細</Label>
        <Textarea
          id="description"
          placeholder="詳細を入力してください（任意）"
          {...register('description')}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">優先度</Label>
          <Select
            value={watchedValues.priority}
            onValueChange={(value) => setValue('priority', value as Priority)}
          >
            <SelectTrigger>
              <SelectValue placeholder="優先度を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Priority.LOW}>低</SelectItem>
              <SelectItem value={Priority.MEDIUM}>中</SelectItem>
              <SelectItem value={Priority.HIGH}>高</SelectItem>
              <SelectItem value={Priority.URGENT}>緊急</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">カテゴリ</Label>
          <Select
            value={watchedValues.category_id?.toString() || "none"}
            onValueChange={(value) => setValue('category_id', value !== "none" ? parseInt(value) : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">カテゴリなし</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>期限日</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : '期限日を設定（任意）'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={handleReset}>
            キャンセル
          </Button>
        )}
        <Button type="submit">
          {initialData ? '更新する' : '追加する'}
          {!initialData && <PlusCircle className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
};