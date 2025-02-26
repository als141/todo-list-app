# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import logging
import sys

# ロギングの設定 - より詳細に
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Google Cloud Secret Managerのインポート
try:
    from google.cloud import secretmanager
    logger.info("Secret Managerライブラリのインポートに成功しました")
except ImportError as e:
    logger.error(f"Secret Managerライブラリのインポートに失敗: {e}")
    secretmanager = None

# .envファイル読み込み
load_dotenv()

# プロジェクトIDを環境変数から取得
project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
logger.info(f"プロジェクトID: {project_id}")

# App Engine環境かどうかを確認
is_appengine = os.getenv('GAE_APPLICATION', None) is not None
logger.info(f"App Engine環境: {is_appengine}")

# Cloud SQLの接続情報を構築（App Engine環境の場合）
cloud_sql_url = None
if is_appengine:
    db_user = os.getenv("DB_USER", "todo_user")
    db_pass = os.getenv("DB_PASS", "algm02315k")
    db_name = os.getenv("DB_NAME", "todos_db")
    instance_connection_name = os.getenv("INSTANCE_CONNECTION_NAME", 
                                       "bright-primacy-446020-g8:asia-northeast1:todo-app-db")
    
    cloud_sql_url = f"postgresql://{db_user}:{db_pass}@/{db_name}?host=/cloudsql/{instance_connection_name}"
    logger.info(f"Cloud SQL接続URL構築: {cloud_sql_url.split('@')[0]}@/***?host=/cloudsql/{instance_connection_name}")

# データベースURL取得の優先順位（App Engine環境では強制的にCloud SQLを使用）
if is_appengine:
    # App Engine環境では環境変数のDATABASE_URLを無視し、Cloud SQL接続を強制使用
    DATABASE_URL = cloud_sql_url
    logger.info("App Engine環境: Cloud SQL接続を強制使用します")
else:
    # 環境変数から取得
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todos.db")
    logger.info(f"ローカル環境: 環境変数からのDATABASE_URL: {DATABASE_URL}")

logger.info(f"最終的に使用するデータベース接続タイプ: {DATABASE_URL.split('://')[0]}")

# SQLite接続設定
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# エンジン作成
try:
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
    logger.info("データベースエンジンの作成に成功しました")
except Exception as e:
    logger.error(f"データベースエンジンの作成に失敗: {e}")
    import traceback
    logger.error(traceback.format_exc())
    raise

# セッションローカルの作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# モデル用のベースクラス
Base = declarative_base()

# 依存性注入用のデータベースセッション取得関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()