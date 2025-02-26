# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import logging

# Google Cloud Secret Managerのインポート
try:
    from google.cloud import secretmanager
except ImportError:
    secretmanager = None

# ロギングの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# .envファイル読み込み
load_dotenv()

# プロジェクトIDを環境変数から取得するか、デフォルト値を使用
project_id = os.getenv("GOOGLE_CLOUD_PROJECT")

# App Engine環境かどうかを確認
is_appengine = os.getenv('GAE_APPLICATION', None) is not None

def access_secret(secret_id, version_id="latest"):
    """Secret Managerからシークレットを取得する関数"""
    if not secretmanager or not project_id:
        logger.warning("Secret ManagerライブラリまたはプロジェクトIDが利用できません")
        return None
    
    try:
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")
    except Exception as e:
        logger.error(f"シークレット取得エラー: {e}")
        return None

# データベースURL取得の優先順位:
# 1. 環境変数 DATABASE_URL
# 2. Secret Manager
# 3. デフォルト値 (環境に応じた)
DATABASE_URL = os.getenv("DATABASE_URL")

# 環境変数でDBURLが設定されていない場合
if not DATABASE_URL:
    # Secret Managerからデータベース接続文字列を取得
    if is_appengine and secretmanager and project_id:
        logger.info("Secret Managerからデータベース設定を取得します")
        DATABASE_URL = access_secret("database-url")
        if DATABASE_URL:
            logger.info("Secret Managerからデータベース接続情報を取得しました")
        else:
            logger.warning("Secret Managerからデータベース接続情報の取得に失敗しました")
    
    # それでもDBURLが設定されていない場合のデフォルト処理
    if not DATABASE_URL:
        if is_appengine:
            # App Engine環境でDBURLが指定されていない場合はインメモリSQLiteを使用
            DATABASE_URL = "sqlite:///:memory:"
            logger.info("App Engine環境：インメモリSQLiteデータベースを使用します")
        else:
            # ローカル環境の場合はファイルベースのSQLiteを使用
            DATABASE_URL = "sqlite:///./todos.db"
            logger.info("ローカル環境：SQLiteファイルデータベースを使用します")

logger.info(f"使用するデータベース接続タイプ: {DATABASE_URL.split('://')[0]}")

# SQLite接続設定
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# エンジン作成
engine = create_engine(DATABASE_URL, connect_args=connect_args)

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