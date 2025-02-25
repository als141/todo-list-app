// frontend/src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Lock, Mail, User } from "lucide-react";
import { useAuthStore } from "@/store";

type LoginFormData = {
  email: string;
  password: string;
};

type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { login, register: registerUser, isLoading, error: authError } = useAuthStore();
  const [activeTab, setActiveTab] = useState("login");

  // ログインフォーム
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>();

  // 新規登録フォーム
  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    watch,
  } = useForm<RegisterFormData>();

  // ログイン処理
  const onLogin = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast("ログインしました", {
        description: "TODOリストへようこそ！",
      });
      router.push("/");
    } catch {
      // エラーは既にstoreでセットされる
    }
  };

  // 新規登録処理
  const onRegister = async (data: RegisterFormData) => {
    try {
      await registerUser(data.username, data.email, data.password);
      toast("登録完了", {
        description: "アカウントが正常に作成されました。",
      });
      router.push("/");
    } catch {
      // エラーは既にstoreでセットされる
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto w-full max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">TODO App</CardTitle>
            <CardDescription>
              タスク管理をより簡単に、よりスマートに
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">ログイン</TabsTrigger>
                <TabsTrigger value="register">新規登録</TabsTrigger>
              </TabsList>
              
              {authError && (
                <div className="bg-destructive/10 text-destructive rounded-md p-3 mb-4 text-sm">
                  {authError}
                </div>
              )}
              
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className={`pl-10 ${loginErrors.email ? "border-destructive" : ""}`}
                        {...registerLogin("email", {
                          required: "メールアドレスを入力してください",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "有効なメールアドレスを入力してください",
                          },
                        })}
                      />
                    </div>
                    {loginErrors.email && (
                      <p className="text-sm text-destructive">{loginErrors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">パスワード</Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className={`pl-10 ${loginErrors.password ? "border-destructive" : ""}`}
                        {...registerLogin("password", {
                          required: "パスワードを入力してください",
                          minLength: {
                            value: 6,
                            message: "パスワードは6文字以上である必要があります",
                          },
                        })}
                      />
                    </div>
                    {loginErrors.password && (
                      <p className="text-sm text-destructive">{loginErrors.password.message}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center">
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                        ログイン中...
                      </span>
                    ) : (
                      "ログイン"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleSignupSubmit(onRegister)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">ユーザー名</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        placeholder="username"
                        className={`pl-10 ${signupErrors.username ? "border-destructive" : ""}`}
                        {...registerSignup("username", {
                          required: "ユーザー名を入力してください",
                          minLength: {
                            value: 3,
                            message: "ユーザー名は3文字以上である必要があります",
                          },
                        })}
                      />
                    </div>
                    {signupErrors.username && (
                      <p className="text-sm text-destructive">{signupErrors.username.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">メールアドレス</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        className={`pl-10 ${signupErrors.email ? "border-destructive" : ""}`}
                        {...registerSignup("email", {
                          required: "メールアドレスを入力してください",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "有効なメールアドレスを入力してください",
                          },
                        })}
                      />
                    </div>
                    {signupErrors.email && (
                      <p className="text-sm text-destructive">{signupErrors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">パスワード</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        className={`pl-10 ${signupErrors.password ? "border-destructive" : ""}`}
                        {...registerSignup("password", {
                          required: "パスワードを入力してください",
                          minLength: {
                            value: 6,
                            message: "パスワードは6文字以上である必要があります",
                          },
                        })}
                      />
                    </div>
                    {signupErrors.password && (
                      <p className="text-sm text-destructive">{signupErrors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">パスワード (確認)</Label>
                    <div className="relative">
                      <CheckCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className={`pl-10 ${signupErrors.confirmPassword ? "border-destructive" : ""}`}
                        {...registerSignup("confirmPassword", {
                          required: "パスワードを再入力してください",
                          validate: (value) =>
                            value === watch("password") || "パスワードが一致しません",
                        })}
                      />
                    </div>
                    {signupErrors.confirmPassword && (
                      <p className="text-sm text-destructive">{signupErrors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center">
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                        登録中...
                      </span>
                    ) : (
                      "アカウント作成"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center text-sm text-muted-foreground">
              {activeTab === "login" ? (
                <span>
                  アカウントをお持ちでない場合は{" "}
                  <button
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={() => setActiveTab("register")}
                  >
                    新規登録
                  </button>
                </span>
              ) : (
                <span>
                  既にアカウントをお持ちの場合は{" "}
                  <button
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={() => setActiveTab("login")}
                  >
                    ログイン
                  </button>
                </span>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}