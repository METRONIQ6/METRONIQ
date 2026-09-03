import os

base_path = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ"
folders = [
    "apps/web",
    "apps/mobile",
    "backend/app/api",
    "backend/app/core",
    "backend/app/models",
    "backend/app/schemas",
    "backend/app/services",
    "backend/app/repositories",
    "backend/app/rules",
    "backend/app/ai",
    "backend/app/risk",
    "backend/app/workflows",
    "backend/tests",
    "database",
    "ai",
    "docs/architecture",
    "sample-data",
    "tests",
    "docker"
]

for folder in folders:
    os.makedirs(os.path.join(base_path, folder.replace("/", "\\")), exist_ok=True)

print("Scaffold complete.")
