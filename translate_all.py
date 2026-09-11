import os

directories = ["frontend/src/app/officer", "frontend/src/app/manufacturer", "frontend/src/app/admin"]

substitutions = {
    '>Portal Unavailable<': '>{t("common.error") || "Portal Unavailable"}<',
    '>Retry Connection<': '>{t("common.retry") || "Retry Connection"}<',
    'Unable to fetch compliance records': '{t("common.retry") || "Unable to fetch records"}',
    '>Rectify<': '>{t("common.action") || "Rectify"}<',
    '>Manage<': '>{t("common.manage") || "Manage"}<',
    '>View<': '>{t("common.view") || "View"}<',
    '>Download<': '>{t("common.download") || "Download"}<',
    '>Rule Management<': '>{t("admin.rulesManagement") || "Rule Management"}<',
}

for d in directories:
    if os.path.exists(d):
        for root, dirs, files in os.walk(d):
            for file in files:
                if file.endswith(".tsx"):
                    path = os.path.join(root, file)
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read()
                    
                    changed = False
                    for pattern, replacement in substitutions.items():
                        if pattern in content:
                            content = content.replace(pattern, replacement)
                            changed = True
                    
                    if changed:
                        with open(path, "w", encoding="utf-8") as f:
                            f.write(content)
print("Complete.")
