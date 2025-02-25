// frontend/src/types/index.ts
export enum Priority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
  }
  
  export interface User {
    id: number;
    email: string;
    username: string;
    is_active: boolean;
  }
  
  export interface Category {
    id: number;
    name: string;
    color: string;
    user_id: number;
  }
  
  export interface Todo {
    id: number;
    task: string;
    description?: string;
    completed: boolean;
    priority: Priority;
    created_at: string; // ISO日付文字列
    due_date?: string; // ISO日付文字列
    completed_at?: string; // ISO日付文字列
    position: number;
    user_id: number;
    category_id?: number;
    category?: Category;
  }
  
  export interface TodoCreate {
    task: string;
    description?: string;
    priority?: Priority;
    due_date?: string; // ISO日付文字列
    category_id?: number;
  }
  
  export interface TodoUpdate {
    task?: string;
    description?: string;
    completed?: boolean;
    priority?: Priority;
    due_date?: string | null; // ISO日付文字列
    category_id?: number | null;
    position?: number;
  }
  
  export interface CategoryCreate {
    name: string;
    color: string;
  }
  
  export interface AuthToken {
    access_token: string;
    token_type: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    email: string;
    username: string;
    password: string;
  }
  
  export interface ApiError {
    status: number;
    message: string;
  }
  
  export type Filter = {
    completed?: boolean;
    category_id?: number;
    priority?: Priority;
    due_date_from?: string;
    due_date_to?: string;
  };