// frontend/src/store/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Todo, Category, Filter, Priority } from '@/types';
import { authApi, todoApi, categoryApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<User | void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.login({ email, password });
          const user = await authApi.getCurrentUser();
          set({ user, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました。';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },
      register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register({ username, email, password });
          await authApi.login({ email, password });
          const user = await authApi.getCurrentUser();
          set({ user, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '登録に失敗しました。';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },
      logout: () => {
        authApi.logout();
        set({ user: null });
      },
      fetchCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          if (!authApi.isAuthenticated()) {
            set({ user: null, isLoading: false });
            throw new Error("認証されていません");
          }
          
          const user = await authApi.getCurrentUser();
          set({ user, isLoading: false });
          return user;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "認証エラーが発生しました";
          set({ 
            user: null, 
            isLoading: false,
            error: errorMessage
          });
          throw error;
        }
      },
    }),
    { name: 'auth-store' }
  )
);

interface TodoState {
  todos: Todo[];
  categories: Category[];
  filters: Filter;
  isLoading: boolean;
  error: string | null;
  fetchTodos: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addTodo: (todo: { task: string; description?: string; priority?: Priority; due_date?: string; category_id?: number }) => Promise<void>;
  updateTodo: (id: number, updates: { task?: string; description?: string; completed?: boolean; priority?: Priority; due_date?: string | null; category_id?: number | null }) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  reorderTodos: (todoIds: number[]) => Promise<void>;
  addCategory: (category: { name: string; color: string }) => Promise<void>;
  updateCategory: (id: number, updates: { name: string; color: string }) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  setFilters: (filters: Filter) => void;
  clearFilters: () => void;
}

export const useTodoStore = create<TodoState>()((set, get) => ({
  todos: [],
  categories: [],
  filters: {},
  isLoading: false,
  error: null,
  fetchTodos: async () => {
    set({ isLoading: true, error: null });
    try {
      const todos = await todoApi.getTodos(get().filters);
      set({ todos, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'タスクの取得に失敗しました。',
      });
    }
  },
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoryApi.getCategories();
      set({ categories, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'カテゴリの取得に失敗しました。',
      });
    }
  },
  addTodo: async (todo) => {
    set({ isLoading: true, error: null });
    try {
      const newTodo = await todoApi.createTodo(todo);
      set((state) => ({
        todos: [...state.todos, newTodo],
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'タスクの追加に失敗しました。',
      });
    }
  },
  updateTodo: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTodo = await todoApi.updateTodo(id, updates);
      set((state) => ({
        todos: state.todos.map((todo) => (todo.id === id ? updatedTodo : todo)),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'タスクの更新に失敗しました。',
      });
    }
  },
  deleteTodo: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await todoApi.deleteTodo(id);
      set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'タスクの削除に失敗しました。',
      });
    }
  },
  reorderTodos: async (todoIds) => {
    set({ isLoading: true, error: null });
    try {
      await todoApi.reorderTodos(todoIds);
      // 現在のtodosからIDに基づいて並び替え
      const reorderedTodos = todoIds.map((id) =>
        get().todos.find((todo) => todo.id === id)
      ).filter((todo): todo is Todo => todo !== undefined);
      
      set({ todos: reorderedTodos, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'タスクの並び替えに失敗しました。',
      });
    }
  },
  addCategory: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await categoryApi.createCategory(category);
      set((state) => ({
        categories: [...state.categories, newCategory],
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'カテゴリの追加に失敗しました。',
      });
    }
  },
  updateCategory: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCategory = await categoryApi.updateCategory(id, updates);
      set((state) => ({
        categories: state.categories.map((category) =>
          category.id === id ? updatedCategory : category
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'カテゴリの更新に失敗しました。',
      });
    }
  },
  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await categoryApi.deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id),
        isLoading: false,
      }));
      // そのカテゴリを持つタスクを再取得
      await get().fetchTodos();
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'カテゴリの削除に失敗しました。',
      });
    }
  },
  setFilters: (filters) => {
    set({ filters });
    get().fetchTodos();
  },
  clearFilters: () => {
    set({ filters: {} });
    get().fetchTodos();
  },
}));

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-store' }
  )
);