"use client"

import { toast as sonnerToast } from "sonner";

type ToastOptions = {
  description?: string;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
};

// 既存のtoastインターフェースと互換性を持たせるためのシンプルなラッパー
export function useToast() {
  return {
    toast: (options: { 
      title?: string; 
      description?: string; 
      variant?: "default" | "destructive" | "success"; 
    }) => {
      const toastOptions: ToastOptions = {
        description: options.description
      };
      
      if (options.variant === "destructive") {
        toastOptions.className = "bg-destructive text-destructive-foreground";
      }
      
      return sonnerToast(options.title || "", toastOptions);
    },
    dismiss: (toastId?: string) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
      } else {
        sonnerToast.dismiss();
      }
    }
  };
}

// 直接エクスポートしたtoastも提供
export const toast = sonnerToast;