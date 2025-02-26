# entrypoint.py
import os
from main import app

# App Engine標準環境は、PORTという環境変数を設定し、
# アプリケーションがその環境変数をリッスンすることを期待しています
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)