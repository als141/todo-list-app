// frontend/src/app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, Filter, Calendar, Check, SlidersHorizontal } from 'lucide-react';
import { TodoCard } from '@/components/TodoCard';
import { TodoForm } from '@/components/TodoForm';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { useAuthStore, useTodoStore } from '@/store';
import { Todo, Priority } from '@/types';
import { format } from 'date-fns';

export default function Home() {
  const { user, fetchCurrentUser } = useAuthStore();
  const { 
    todos, 
    categories, 
    filters,
    fetchTodos, 
    fetchCategories, 
    addTodo, 
    updateTodo, 
    deleteTodo,
    setFilters,
    clearFilters
  } = useTodoStore();
  
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [view, setView] = useState<'list' | 'grid'>('list');

  // 認証状態チェック
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetchCurrentUser();
      } catch {
        console.log("認証エラー、ログインページにリダイレクトします");
        window.location.href = '/login';
      }
    };
    
    checkAuth();
  }, [fetchCurrentUser]);

  // データ取得
  useEffect(() => {
    if (user) {
      fetchTodos();
      fetchCategories();
    }
  }, [user, fetchTodos, fetchCategories]);

  useEffect(() => {
    if (todos.length > 0) {
      console.log("すべてのタスク数:", todos.length);
      console.log("完了済みタスク数:", todos.filter(todo => todo.completed).length);
      console.log("完了済みタスク:", todos.filter(todo => todo.completed));
    }
  }, [todos]);
  
  // タスクの追加
  const handleAddTodo = async (data: Record<string, unknown>) => {
    try {
      await addTodo({
        task: data.task as string,
        description: data.description as string | undefined,
        priority: data.priority as Priority | undefined,
        due_date: data.due_date ? format(data.due_date as Date, "yyyy-MM-dd'T'HH:mm:ss") : undefined,
        category_id: data.category_id as number | undefined
      });
      setShowAddDialog(false);
      toast("タスクを追加しました", {
        description: data.task as string,
      });
    } catch {
      toast("タスクの追加に失敗しました", {
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  // タスクの更新
  const handleUpdateTodo = async (data: Record<string, unknown>) => {
    if (!editingTodo) return;
    
    try {
      await updateTodo(editingTodo.id, {
        task: data.task as string | undefined,
        description: data.description as string | undefined,
        priority: data.priority as Priority | undefined,
        due_date: data.due_date ? format(data.due_date as Date, "yyyy-MM-dd'T'HH:mm:ss") : null,
        category_id: data.category_id as number | null | undefined
      });
      setShowEditDialog(false);
      setEditingTodo(null);
      toast("タスクを更新しました", {
        description: data.task as string,
      });
    } catch {
      toast("タスクの更新に失敗しました", {
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  // タスクの削除
  const handleDeleteTodo = async (id: number) => {
    try {
      await deleteTodo(id);
      toast("タスクを削除しました");
    } catch {
      toast("タスクの削除に失敗しました", {
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  // 検索フィルター
  const filteredTodos = todos.filter(todo => 
    todo.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // タスクの完了/未完了
  const completedTodos = filteredTodos.filter(todo => todo.completed);
  const incompleteTodos = filteredTodos.filter(todo => !todo.completed);

  // 日付フィルター
  const handleDateFilter = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setFilters({ 
        ...filters,
        due_date_from: `${formattedDate}T00:00:00`,
        due_date_to: `${formattedDate}T23:59:59`
      });
    } else {
      const tempFilters = { ...filters };
      delete tempFilters.due_date_from;
      delete tempFilters.due_date_to;
      setFilters(tempFilters);
    }
  };

  // タスク更新ハンドラ
  const handleQuickUpdate = async (id: number, updates: Record<string, unknown>) => {
    try {
      await updateTodo(id, updates as { completed?: boolean });
      if (updates.completed) {
        toast("タスクを完了しました");
      }
    } catch {
      toast("タスクの更新に失敗しました", {
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  // 編集ダイアログを開く
  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setShowEditDialog(true);
  };

  // カテゴリフィルター
  const handleCategoryFilter = (categoryId: number | null) => {
    setFilters({
      ...filters,
      category_id: categoryId || undefined
    });
  };

  // 優先度フィルター
  const handlePriorityFilter = (priority: Priority | null) => {
    setFilters({
      ...filters,
      priority: priority || undefined
    });
  };

  // 未完了/完了フィルター
  const handleCompletedFilter = (completed: boolean | null) => {
    setFilters({
      ...filters,
      completed: completed === null ? undefined : completed
    });
  };

  // 全フィルタークリア
  const handleClearFilters = () => {
    clearFilters();
    setSearchTerm('');
    setSelectedDate(undefined);
  };

  // ユーザーがログインしていない場合はローディング表示
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto py-6 px-4 sm:px-6 md:px-8 max-w-6xl">
        <div className="flex flex-col space-y-4">
          {/* ヘッダー */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">TODOリスト</h1>
              <p className="text-muted-foreground">
                こんにちは、{user.username}さん。
              </p>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="sm" className="sm:ml-auto">
              <Plus className="mr-2 h-4 w-4" /> 新しいタスク
            </Button>
          </header>

          <Separator />

          {/* 検索バーとフィルター */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="タスクを検索..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    フィルター
                    {Object.keys(filters).length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                        {Object.keys(filters).length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-4">
                    <h4 className="font-medium leading-none">フィルター</h4>
                    <Separator />
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">ステータス</h5>
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant={filters.completed === false ? "default" : "outline"} 
                          className="cursor-pointer"
                          onClick={() => handleCompletedFilter(filters.completed === false ? null : false)}
                        >
                          未完了
                        </Badge>
                        <Badge 
                          variant={filters.completed === true ? "default" : "outline"} 
                          className="cursor-pointer"
                          onClick={() => handleCompletedFilter(filters.completed === true ? null : true)}
                        >
                          完了済み
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">優先度</h5>
                      <div className="flex flex-wrap gap-2">
                        {Object.values(Priority).map((priority) => (
                          <Badge 
                            key={priority} 
                            variant={filters.priority === priority ? "default" : "outline"} 
                            className="cursor-pointer"
                            onClick={() => handlePriorityFilter(filters.priority === priority ? null : priority)}
                          >
                            {priority === Priority.LOW && '低'}
                            {priority === Priority.MEDIUM && '中'}
                            {priority === Priority.HIGH && '高'}
                            {priority === Priority.URGENT && '緊急'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">カテゴリ</h5>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <Badge 
                            key={category.id} 
                            variant={filters.category_id === category.id ? "default" : "outline"} 
                            className="cursor-pointer"
                            style={filters.category_id === category.id ? undefined : { 
                              borderColor: category.color,
                              backgroundColor: `${category.color}20`
                            }}
                            onClick={() => handleCategoryFilter(filters.category_id === category.id ? null : category.id)}
                          >
                            <span 
                              className="w-2 h-2 rounded-full mr-1" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleClearFilters}
                    >
                      フィルターをクリア
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Calendar className="h-4 w-4 mr-2" />
                    日付
                    {selectedDate && (
                      <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                        1
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>表示オプション</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setView('list')}>
                    <Check className={`mr-2 h-4 w-4 ${view === 'list' ? 'opacity-100' : 'opacity-0'}`} />
                    リスト表示
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setView('grid')}>
                    <Check className={`mr-2 h-4 w-4 ${view === 'grid' ? 'opacity-100' : 'opacity-0'}`} />
                    グリッド表示
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* アクティブなフィルターの表示 */}
          {Object.keys(filters).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.completed !== undefined && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>ステータス: {filters.completed ? '完了済み' : '未完了'}</span>
                  <button onClick={() => handleCompletedFilter(null)} className="ml-1">
                    &times;
                  </button>
                </Badge>
              )}
              
              {filters.priority && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>優先度: {
                    filters.priority === Priority.LOW ? '低' :
                    filters.priority === Priority.MEDIUM ? '中' :
                    filters.priority === Priority.HIGH ? '高' : '緊急'
                  }</span>
                  <button onClick={() => handlePriorityFilter(null)} className="ml-1">
                    &times;
                  </button>
                </Badge>
              )}
              
              {filters.category_id && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>カテゴリ: {
                    categories.find(c => c.id === filters.category_id)?.name
                  }</span>
                  <button onClick={() => handleCategoryFilter(null)} className="ml-1">
                    &times;
                  </button>
                </Badge>
              )}
              
              {(filters.due_date_from || filters.due_date_to) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>日付: {selectedDate && format(selectedDate, 'yyyy/MM/dd')}</span>
                  <button onClick={() => handleDateFilter(undefined)} className="ml-1">
                    &times;
                  </button>
                </Badge>
              )}
              
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs h-6">
                すべてクリア
              </Button>
            </div>
          )}

          {/* メインコンテンツ */}
          <Tabs defaultValue="incomplete" className="w-full">
            <TabsList>
              <TabsTrigger value="incomplete">
                未完了 ({incompleteTodos.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                完了済み ({completedTodos.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="incomplete">
              {incompleteTodos.length === 0 ? (
                <Card>
                  <CardContent className="py-10 flex flex-col items-center">
                    <div className="rounded-full bg-primary/10 p-3 mb-3">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-center text-muted-foreground">
                      すべてのタスクが完了しています！
                    </p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowAddDialog(true)}>
                      新しいタスクを追加
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={`grid gap-3 ${view === 'grid' ? 'sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
                  <AnimatePresence>
                    {incompleteTodos.map((todo) => (
                      <motion.div
                        key={todo.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TodoCard
                          todo={todo}
                          onUpdate={handleQuickUpdate}
                          onEdit={handleEditClick}
                          onDelete={handleDeleteTodo}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
            <TabsContent value="completed">
  {completedTodos.length === 0 ? (
    <Card>
      <CardContent className="py-10 flex flex-col items-center">
        <p className="text-center text-muted-foreground">
          完了したタスクはまだありません。
        </p>
      </CardContent>
    </Card>
  ) : (
    <div className={`grid gap-3 ${view === 'grid' ? 'sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
      {/* AnimatePresenceを一時的に削除してアニメーションによる問題を排除 */}
      {completedTodos.map((todo) => (
        <div key={todo.id} className="transition-all duration-200">
          <TodoCard
            todo={todo}
            onUpdate={handleQuickUpdate}
            onEdit={handleEditClick}
            onDelete={handleDeleteTodo}
          />
        </div>
      ))}
    </div>
  )}
</TabsContent>
          </Tabs>
        </div>

        {/* 新規タスク追加ダイアログ */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しいタスクを追加</DialogTitle>
              <DialogDescription>
                新しいタスクの詳細を入力してください。
              </DialogDescription>
            </DialogHeader>
            <TodoForm
              categories={categories}
              onSubmit={handleAddTodo}
              onCancel={() => setShowAddDialog(false)}
            />
          </DialogContent>
        </Dialog>
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>タスクを編集</DialogTitle>
              <DialogDescription>
                タスクの詳細を変更してください。
              </DialogDescription>
            </DialogHeader>
            {editingTodo && (
              <TodoForm
                initialData={editingTodo}
                categories={categories}
                onSubmit={handleUpdateTodo}
                onCancel={() => setShowEditDialog(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}