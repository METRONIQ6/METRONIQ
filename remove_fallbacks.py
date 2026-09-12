import os
import re

# 1. Remove fallbacks: t('key') || "string"
def remove_fallback(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replaces: t('something') || "Fallback text" => t('something')
    # Or t('something') || 'Fallback text' => t('something')
    new_content = re.sub(r'(t\([^)]+\))\s*\|\|\s*["\'][^"\']+["\']', r'\1', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fallback removed in {filepath}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.tsx'):
            remove_fallback(os.path.join(root, file))

# 2. Hand-patch specific stragglers missed by simple regex
patches = [
    ("frontend/src/components/layout/DashboardLayout.tsx", "Logout", "{t('common.logout')}"),
    ("frontend/src/app/officer/dashboard/page.tsx", "Violation", "{t('status.violation', 'Violation')}"),
]

for file, old, new in patches:
    path = os.path.join(os.getcwd(), file.replace('/', os.sep))
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            c = f.read()
        # This replaces the literal word exactly, if not inside a t('')
        # Since it's tough with regex, we can just replace the specific text block.
        # "Logout" exists freely
        if old == "Logout":
            c = c.replace("                        Logout", "                        {t('common.logout')}")
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)

print("Cleanup complete")
