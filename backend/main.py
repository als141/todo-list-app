# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import os
import logging

# ロギングの設定
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

import models
import schemas
import auth
from database import get_db, engine

app = FastAPI(title="モダンTODOアプリAPI")

# フロントエンドのURL
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://todo-list-app-eta-two.vercel.app")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    # 明示的にフロントエンドURLを指定
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

logger.info(f"CORS設定: allow_origins={[FRONTEND_URL, 'http://localhost:3000']}")

# App Engine環境かどうかを確認
is_appengine = os.getenv('GAE_APPLICATION', None) is not None

# データベース初期化
models.Base.metadata.create_all(bind=engine)

# App Engine環境でインメモリDBを使用する場合のみ初期データを投入
if is_appengine and os.getenv("DATABASE_URL", "").startswith("sqlite:///:memory:"):
    # セッションの作成
    from database import SessionLocal
    db = SessionLocal()
    try:
        # ダミーユーザーの作成（デモ用）
        test_user_email = "test@example.com"
        existing_user = db.query(models.User).filter(models.User.email == test_user_email).first()
        if not existing_user:
            hashed_password = auth.get_password_hash("password123")
            test_user = models.User(
                email=test_user_email,
                username="testuser",
                hashed_password=hashed_password
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
            
            # デフォルトカテゴリの作成
            categories = [
                {"name": "仕事", "color": "#EF4444"},     # 赤
                {"name": "個人", "color": "#3B82F6"},     # 青
                {"name": "買い物", "color": "#10B981"},   # 緑
                {"name": "勉強", "color": "#F59E0B"},     # オレンジ
            ]
            
            for cat in categories:
                db_category = models.Category(
                    name=cat["name"],
                    color=cat["color"],
                    user_id=test_user.id
                )
                db.add(db_category)
            
            db.commit()
    except Exception as e:
        print(f"初期データ作成エラー: {e}")
    finally:
        db.close()

# ルートエンドポイント
@app.get("/")
def read_root():
    return {"message": "モダンTODOアプリAPI", "status": "running"}

# ユーザー登録
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = auth.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # ユーザーオブジェクト作成
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # デフォルトカテゴリ作成
    default_categories = [
        {"name": "仕事", "color": "#EF4444"},     # 赤
        {"name": "個人", "color": "#3B82F6"},     # 青
        {"name": "買い物", "color": "#10B981"},   # 緑
        {"name": "勉強", "color": "#F59E0B"},     # オレンジ
    ]
    
    for cat in default_categories:
        db_category = models.Category(
            name=cat["name"],
            color=cat["color"],
            user_id=db_user.id
        )
        db.add(db_category)
    
    db.commit()
    
    return db_user

# ログイン処理
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# カテゴリー関連エンドポイント
@app.get("/categories/", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    categories = db.query(models.Category).filter(models.Category.user_id == current_user.id).all()
    return categories

@app.post("/categories/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_category = models.Category(**category.dict(), user_id=current_user.id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.put("/categories/{category_id}", response_model=schemas.Category)
def update_category(category_id: int, category: schemas.CategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id
    ).first()
    
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for key, value in category.dict().items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

@app.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id
    ).first()
    
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # このカテゴリに属するタスクのカテゴリをNullに設定
    todos = db.query(models.Todo).filter(models.Todo.category_id == category_id).all()
    for todo in todos:
        todo.category_id = None
    
    db.delete(db_category)
    db.commit()
    
    return {"message": "Category deleted"}

# TODO関連エンドポイント
@app.get("/todos/", response_model=List[schemas.Todo])
def get_todos(
    completed: Optional[bool] = None,
    category_id: Optional[int] = None,
    priority: Optional[str] = None,
    due_date_from: Optional[datetime] = None,
    due_date_to: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Todo).filter(models.Todo.user_id == current_user.id)
    
    if completed is not None:
        query = query.filter(models.Todo.completed == completed)
    
    if category_id:
        query = query.filter(models.Todo.category_id == category_id)
    
    if priority:
        query = query.filter(models.Todo.priority == priority)
    
    if due_date_from:
        query = query.filter(models.Todo.due_date >= due_date_from)
    
    if due_date_to:
        query = query.filter(models.Todo.due_date <= due_date_to)
    
    return query.order_by(models.Todo.position).all()

@app.post("/todos/", response_model=schemas.Todo)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    # 最大のposition値を取得
    max_position = db.query(models.Todo).filter(
        models.Todo.user_id == current_user.id
    ).order_by(models.Todo.position.desc()).first()
    
    new_position = 0
    if max_position:
        new_position = max_position.position + 1
    
    # todo.dict()から'position'を除外して新しいデータ辞書を作成
    todo_data = todo.dict(exclude={"position"})
    
    # 除外した辞書を使って新しいTodoオブジェクトを作成
    db_todo = models.Todo(**todo_data, user_id=current_user.id, position=new_position)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@app.get("/todos/{todo_id}", response_model=schemas.Todo)
def get_todo(todo_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id,
        models.Todo.user_id == current_user.id
    ).first()
    
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    return db_todo

@app.put("/todos/{todo_id}", response_model=schemas.Todo)
def update_todo(todo_id: int, todo: schemas.TodoUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id,
        models.Todo.user_id == current_user.id
    ).first()
    
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    update_data = todo.dict(exclude_unset=True)
    
    # 完了状態が変更された場合、completed_atを更新
    if "completed" in update_data and update_data["completed"] != db_todo.completed:
        if update_data["completed"]:
            update_data["completed_at"] = datetime.utcnow()
        else:
            update_data["completed_at"] = None
    
    for key, value in update_data.items():
        setattr(db_todo, key, value)
    
    db.commit()
    db.refresh(db_todo)
    return db_todo

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id,
        models.Todo.user_id == current_user.id
    ).first()
    
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    db.delete(db_todo)
    db.commit()
    
    return {"message": "Todo deleted"}

@app.post("/todos/reorder")
def reorder_todos(
    todo_ids: List[int] = Body(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # 順序の更新
    for i, todo_id in enumerate(todo_ids):
        todo = db.query(models.Todo).filter(
            models.Todo.id == todo_id,
            models.Todo.user_id == current_user.id
        ).first()
        
        if todo:
            todo.position = i
    
    db.commit()
    
    return {"message": "Todos reordered successfully"}

# ユーザー情報取得
@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user