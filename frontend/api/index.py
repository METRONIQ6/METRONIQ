
import sys
import os

# root is parent of frontend
frontend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
root_dir = os.path.dirname(frontend_dir)
backend_dir = os.path.join(root_dir, 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.main import app
except Exception as e:
    import traceback
    from fastapi import FastAPI
    app = FastAPI()
    err = traceback.format_exc()
    @app.get('/api/{path:path}')
    def error_route():
        return {'error': str(e), 'trace': err}

