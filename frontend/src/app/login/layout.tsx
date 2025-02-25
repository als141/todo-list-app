// frontend/src/app/login/layout.tsx
// このファイルを作成して、認証チェックとリダイレクトのロジックを追加します

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    // すでにログインしている場合はホームページにリダイレクト
    if (user && !isLoading) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  return <>{children}</>;
}