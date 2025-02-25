// frontend/src/components/TodoCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Clock, AlertCircle, ArrowUp, Edit, Trash } from 'lucide-react';
import { Todo, Priority } from '@/types';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface TodoCardProps {
  todo: Todo;
  onUpdate: (id: number, updates: { completed?: boolean }) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onUpdate,
  onEdit,
  onDelete
}) => {
  // 優先度に基づくスタイルとアイコン
  const priorityConfig = {
    [Priority.LOW]: {
      icon: <Clock className="h-4 w-4 text-blue-500" />,
      label: '低',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    },
    [Priority.MEDIUM]: {
      icon: <Clock className="h-4 w-4 text-green-500" />,
      label: '中',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    },
    [Priority.HIGH]: {
      icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
      label: '高',
      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
    },
    [Priority.URGENT]: {
      icon: <ArrowUp className="h-4 w-4 text-red-500" />,
      label: '緊急',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
  };

  // 期日が過ぎているかチェック
  const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed;

  // 期日の表示
  const dueDateDisplay = todo.due_date
    ? formatDistanceToNow(new Date(todo.due_date), { addSuffix: true, locale: ja })
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "p-4 rounded-lg border bg-card shadow-sm transition-all hover:shadow",
        todo.completed && "opacity-70"
      )}
      style={{
        borderLeft: todo.category ? `4px solid ${todo.category.color}` : undefined
      }}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={(checked) => onUpdate(todo.id, { completed: checked as boolean })}
          className="mt-1"
        />
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={cn(
              "font-medium text-base leading-none mb-1",
              todo.completed && "line-through text-muted-foreground"
            )}>
              {todo.task}
            </h3>
            
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(todo)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(todo.id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {todo.description && (
            <p className={cn(
              "text-sm text-muted-foreground mt-1", 
              todo.completed && "line-through"
            )}>
              {todo.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {todo.category && (
              <Badge 
                variant="outline" 
                style={{ 
                  backgroundColor: `${todo.category.color}20`, 
                  borderColor: todo.category.color 
                }}
              >
                {todo.category.name}
              </Badge>
            )}
            
            <Badge variant="outline" className={priorityConfig[todo.priority].className}>
              {priorityConfig[todo.priority].icon}
              <span className="ml-1">{priorityConfig[todo.priority].label}</span>
            </Badge>
            
            {dueDateDisplay && (
              <Badge variant={isOverdue ? "destructive" : "outline"} className="ml-auto">
                <Clock className="h-3 w-3 mr-1" />
                {dueDateDisplay}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};