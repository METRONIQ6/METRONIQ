"""
Vercel Serverless Function Entrypoint for MetronIQ FastAPI Backend.

Vercel auto-discovers this file at api/index.py (relative to project root)
and routes /api/* requests to the exported `app` ASGI instance.
"""
import sys
import os
from types import ModuleType


# ── Step 1: Mock heavy AI/CV libraries that exceed Vercel's 250 MB limit.

class _MockModule(ModuleType):
    def __getattr__(self, key):
        if key == "__path__":
            return []
        return _MockModule(f"{self.__name__}.{key}")
    def __call__(self, *args, **kwargs):
        return _MockModule("MockReturn")


class _HeavyLibMocker:
    _MOCKED = {
        "cv2", "numpy", "paddleocr", "playwright", "google",
        "fpdf", "apscheduler", "httpx", "ultralytics", "torch",
        "torchvision", "paddlepaddle", "paddlex", "shapely",
        "modelscope", "huggingface_hub",
    }

    def find_spec(self, fullname, path, target=None):
        if fullname.split(".")[0] in self._MOCKED:
            import importlib.machinery
            return importlib.machinery.ModuleSpec(fullname, self)
        return None

    def create_module(self, spec):
        return _MockModule(spec.name)

    def exec_module(self, module):
        pass


sys.meta_path.insert(0, _HeavyLibMocker())

# ── Step 2: Add backend/ to sys.path.
#    Layout: repo_root/api/index.py  →  repo_root/backend/app/main.py
_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_BACKEND_DIR = os.path.join(_REPO_ROOT, "backend")

if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

# ── Step 3: Import the FastAPI app (Vercel expects `app`).
from app.main import app  # noqa: E402, F401
