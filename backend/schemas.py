# backend/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from models import PriorityEnum

# User関連スキーマ
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True  # 'orm_mode' から 'from_attributes' に変更

# Category関連スキーマ
class CategoryBase(BaseModel):
    name: str
    color: Optional[str] = "#3B82F6"

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True  # 'orm_mode' から 'from_attributes' に変更

# Todo関連スキーマ
class TodoBase(BaseModel):
    task: str
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = PriorityEnum.MEDIUM
    due_date: Optional[datetime] = None
    category_id: Optional[int] = None

# positionフィールドを削除（サーバー側で管理）
class TodoCreate(TodoBase):
    pass

# 必要な場合はTodoUpdate内でpositionを引き続き使用
class TodoUpdate(BaseModel):
    task: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[PriorityEnum] = None
    due_date: Optional[datetime] = None
    category_id: Optional[int] = None
    position: Optional[int] = None

class Todo(TodoBase):
    id: int
    completed: bool
    created_at: datetime
    completed_at: Optional[datetime] = None
    user_id: int
    category: Optional[Category] = None

    class Config:
        from_attributes = True  # 'orm_mode' から 'from_attributes' に変更

# Token関連スキーマ
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None