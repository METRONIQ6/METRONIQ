import os
import re

directory = "frontend/src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Strip || "Fallback" where t(...) is used
    # e.g., t('navigation.dashboard') || 'Dashboard' -> t('navigation.dashboard')
    content = re.sub(r'(t\([\'"][a-zA-Z0-9_.]+[\'"]\))\s*\|\|\s*[\'"][^\'"]+[\'"]', r'\1', content)

    # 2. JSX Tag contents mapping
    # E.g. >Dashboard< or >Active Notices Dashboard<
    mappings = {
        r'>Dashboard<': r'>{t("navigation.dashboard")}<',
        r'>Active Notices Dashboard<': r'>{t("notices.dashboardTitle")}<',
        r'>Service Unavailable<': r'>{t("error.failedLoad")}<',
        r'>Notices subsystem is unresponsive\.<': r'>{t("error.unresponsive")}<',
        r'>Retry Connection<': r'>{t("error.retryConnection")}<',
        r'>Official Notice Dossier<': r'>{t("notices.dossierTitle")}<',
        r'>Comprehensive metadata and compliance logs regarding this specific notice block\.<': r'>{t("notices.dossierDesc")}<',
        r'>System ID<': r'>{t("notices.systemId")}<',
        r'>Inspection Ref<': r'>{t("notices.inspectionRef")}<',
        r'>Current Status<': r'>{t("notices.currentStatus")}<',
        r'>Violation Log<': r'>{t("notices.violationLog")}<',
        r'>Required Fix<': r'>{t("notices.requiredFix")}<',
        r'>Compliance By<': r'>{t("notices.complianceBy")}<',
        r'>Dismiss Dossier<': r'>{t("notices.dismissDossier")}<',
        r'>Schedule Recheck<': r'>{t("notices.schedule")}<',
        r'>Approve<': r'>{t("notices.approve")}<',
        r'>View<': r'>{t("common.view")}<',
        r'>Pending Setup<': r'>{t("notices.pendingSetup")}<',
        r'>Closed<': r'>{t("status.CLOSED")}<',
        # Dynamic replacements {n.status || "UNKNOWN"}
        r'\{n\.status\s*\|\|\s*["\']UNKNOWN["\']\}': r"{t('status.' + (n.status || 'UNKNOWN'))}",
        r'\{selectedNotice\.status\}': r"{t('status.' + (selectedNotice.status || 'UNKNOWN'))}",
        r'\{n\.status\}': r"{t('status.' + (n.status || 'UNKNOWN'))}",
    }

    for pattern, replacement in mappings.items():
        content = re.sub(pattern, replacement, content)

    # Note: Need to make sure useTranslation is imported if we inject {t(...)} where it wasn't
    if "{t(" in content and "useTranslation" not in content:
        # Not perfect, but a simplistic injection if we just added it blindly
        pass

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched: {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            process_file(os.path.join(root, file))

print("Pass 1 JSX Text completed.")
