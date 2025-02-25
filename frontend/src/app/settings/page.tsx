// frontend/src/app/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Moon, Sun, Laptop, Plus, Trash, ChevronLeft,
  LogOut, Settings, User, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/components/CategoryForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore, useTodoStore, useThemeStore } from "@/store";
import { Category } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, logout } = useAuthStore();
  const { categories, fetchCategories, addCategory, updateCategory, deleteCategory } = useTodoStore();
  const { theme, setTheme } = useThemeStore();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // 認証状態チェック
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // カテゴリデータ取得
  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user, fetchCategories]);

  // ログアウト
  const handleLogout = () => {
    logout();
    router.push("/login");
    toast({
      title: "ログアウトしました",
    });
  };

  // カテゴリ追加
  const handleAddCategory = async (data: { name: string; color: string }) => {
    try {
      await addCategory(data);
      setShowAddDialog(false);
      toast({
        title: "カテゴリを追加しました",
        description: data.name,
      });
    } catch (error) {
      toast({
        title: "カテゴリの追加に失敗しました",
        variant: "destructive",
      });
    }
  };

  // カテゴリ更新
  const handleUpdateCategory = async (data: { name: string; color: string }) => {
    if (!editingCategory) return;
    
    try {
      await updateCategory(editingCategory.id, data);
      setShowEditDialog(false);
      setEditingCategory(null);
      toast({
        title: "カテゴリを更新しました",
        description: data.name,
      });
    } catch (error) {
      toast({
        title: "カテゴリの更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  // カテゴリ削除
  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategory(id);
      toast({
        title: "カテゴリを削除しました",
      });
    } catch (error) {
      toast({
        title: "カテゴリの削除に失敗しました",
        variant: "destructive",
      });
    }
  };

  // 編集ダイアログを開く
  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setShowEditDialog(true);
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
    <div className="container mx-auto py-6 px-4 sm:px-6 md:px-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-2">
          <ChevronLeft className="mr-2 h-4 w-4" /> ホームに戻る
        </Button>
        <h1 className="text-3xl font-bold">設定</h1>
        <p className="text-muted-foreground">
          アプリケーションの設定とカテゴリーの管理
        </p>
      </div>
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* アカウント情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" /> アカウント情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">ユーザー名</p>
              <p className="text-base">{user.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium">メールアドレス</p>
              <p className="text-base">{user.email}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleLogout} className="w-full">
              <LogOut className="mr-2 h-4 w-4" /> ログアウト
            </Button>
          </CardFooter>
        </Card>
        
        {/* テーマ設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" /> 外観設定
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium">テーマ</p>
              <div className="flex space-x-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="flex-1"
                >
                  <Sun className="mr-2 h-4 w-4" /> ライト
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="flex-1"
                >
                  <Moon className="mr-2 h-4 w-4" /> ダーク
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="flex-1"
                >
                  <Laptop className="mr-2 h-4 w-4" /> システム
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* カテゴリ管理 */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">カテゴリ管理</h2>
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" /> 新しいカテゴリ
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(category)}>
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-500 focus:text-red-500"
                        >
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="w-full h-12 rounded-md"
                    style={{
                      backgroundColor: `${category.color}30`,
                      borderLeft: `4px solid ${category.color}`,
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* カテゴリ追加ダイアログ */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>新しいカテゴリを追加</DialogTitle>
            <DialogDescription>
                カテゴリの詳細情報を入力してください。
            </DialogDescription>
            </DialogHeader>
            <CategoryForm
            onSubmit={handleAddCategory}
            onCancel={() => setShowAddDialog(false)}
            />
        </DialogContent>
        </Dialog>
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>カテゴリを編集</DialogTitle>
            <DialogDescription>
                カテゴリの詳細情報を変更してください。
            </DialogDescription>
            </DialogHeader>
            {editingCategory && (
            <CategoryForm
                initialData={editingCategory}
                onSubmit={handleUpdateCategory}
                onCancel={() => setShowEditDialog(false)}
            />
            )}
        </DialogContent>
        </Dialog>
    </div>
  );
}