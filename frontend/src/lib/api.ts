// frontend/src/lib/api.ts
import axios, { AxiosError } from 'axios';
import { 
  Todo, 
  TodoCreate, 
  TodoUpdate, 
  Category, 
  CategoryCreate, 
  User, 
  LoginCredentials, 
  RegisterData,
  AuthToken,
  Filter
} from '@/types';

// APIの基本URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Axiosインスタンスの作成
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（トークンの自動追加）
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 401エラー（認証切れ）の場合、ログアウト処理
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 認証関連API
export const authApi = {
  // ログイン
  login: async (credentials: LoginCredentials): Promise<AuthToken> => {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await api.post<AuthToken>('/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // トークンをローカルストレージに保存
    localStorage.setItem('token', response.data.access_token);
    
    return response.data;
  },

  // 新規ユーザー登録
  register: async (userData: RegisterData): Promise<User> => {
    const response = await api.post<User>('/users/', userData);
    return response.data;
  },

  // 現在のユーザー情報取得
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me/');
    return response.data;
  },

  // ログアウト
  logout: (): void => {
    localStorage.removeItem('token');
  },

  // ログイン状態チェック
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};

// TODOタスク関連API
export const todoApi = {
  // タスク一覧取得
  getTodos: async (filters?: Filter): Promise<Todo[]> => {
    const params: Record<string, unknown> = {};
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params[key] = value;
        }
      });
    }
    
    const response = await api.get<Todo[]>('/todos/', { params });
    return response.data;
  },

  // タスク取得
  getTodo: async (id: number): Promise<Todo> => {
    const response = await api.get<Todo>(`/todos/${id}`);
    return response.data;
  },

  // タスク作成
  createTodo: async (todo: TodoCreate): Promise<Todo> => {
    const response = await api.post<Todo>('/todos/', todo);
    return response.data;
  },

  // タスク更新
  updateTodo: async (id: number, todo: TodoUpdate): Promise<Todo> => {
    const response = await api.put<Todo>(`/todos/${id}`, todo);
    return response.data;
  },

  // タスク削除
  deleteTodo: async (id: number): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },

  // タスク並び替え
  reorderTodos: async (todoIds: number[]): Promise<void> => {
    await api.post('/todos/reorder', todoIds);
  },
};

// カテゴリ関連API
export const categoryApi = {
  // カテゴリ一覧取得
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories/');
    return response.data;
  },

  // カテゴリ作成
  createCategory: async (category: CategoryCreate): Promise<Category> => {
    const response = await api.post<Category>('/categories/', category);
    return response.data;
  },

  // カテゴリ更新
  updateCategory: async (id: number, category: CategoryCreate): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, category);
    return response.data;
  },

  // カテゴリ削除
  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

export default api;