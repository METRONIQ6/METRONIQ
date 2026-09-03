import os
import re

# We will apply rigorous regex replacements to wire i18n into these specific files.
# It uses AST-like safety by just inserting useTranslation.

FILES = [
    'frontend/src/app/officer/dashboard/page.tsx',
    'frontend/src/app/officer/notices/page.tsx',
    'frontend/src/app/officer/reinspections/page.tsx',
    'frontend/src/app/officer/enforcement/page.tsx',
    'frontend/src/app/officer/ecommerce/page.tsx',
    'frontend/src/app/manufacturer/dashboard/page.tsx',
    'frontend/src/app/admin/rules/page.tsx'
]

# (File, Match, Replace)
REPLACEMENTS = [
    (
        'frontend/src/app/officer/dashboard/page.tsx',
        'export default function OfficerDashboard() {',
        'import { useTranslation } from "@/i18n"\n\nexport default function OfficerDashboard() {\n    const { t } = useTranslation()'
    ),
    (
        'frontend/src/app/officer/dashboard/page.tsx',
        '<h2 className="text-2xl font-bold tracking-tight">Officer Dashboard</h2>',
        '<h2 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h2>'
    ),
    (
        'frontend/src/app/officer/dashboard/page.tsx',
        'Start New Inspection',
        '{t("dashboard.startInspection")}'
    ),
    (
        'frontend/src/app/officer/dashboard/page.tsx',
        '<CardTitle className="text-sm font-medium text-slate-500">Total Inspections</CardTitle>',
        '<CardTitle className="text-sm font-medium text-slate-500">{t("dashboard.totalInspections")}</CardTitle>'
    ),
    (
        'frontend/src/app/officer/dashboard/page.tsx',
        '<CardTitle className="text-sm font-medium text-slate-500">Pending Reviews</CardTitle>',
        '<CardTitle className="text-sm font-medium text-slate-500">{t("dashboard.pendingReviews")}</CardTitle>'
    ),
    (
        'frontend/src/app/officer/dashboard/page.tsx',
        '<CardTitle className="text-sm font-medium text-slate-500">Compliance Rate</CardTitle>',
        '<CardTitle className="text-sm font-medium text-slate-500">{t("dashboard.complianceRate")}</CardTitle>'
    ),
    (
        'frontend/src/app/officer/dashboard/page.tsx',
        '<h3 className="text-lg font-medium">INSPECTION PRIORITY</h3>',
        '<h3 className="text-lg font-medium">{t("dashboard.inspectionPriority")}</h3>'
    ),
    (
        'frontend/src/app/officer/dashboard/page.tsx',
        '<TableHead>Action</TableHead>',
        '<TableHead>{t("common.action")}</TableHead>'
    ),
    (
        'frontend/src/app/officer/dashboard/page.tsx',
        '<TableHead>Status</TableHead>',
        '<TableHead>{t("common.status")}</TableHead>'
    ),
    (
        'frontend/src/app/officer/dashboard/page.tsx',
        '{n.status}',
        '{t("status." + n.status)}'
    ),
    
    # NOTICES
    (
        'frontend/src/app/officer/notices/page.tsx',
        'export default function ImprovementNotices() {',
        'import { useTranslation } from "@/i18n"\n\nexport default function ImprovementNotices() {\n    const { t } = useTranslation()'
    ),
    (
        'frontend/src/app/officer/notices/page.tsx',
        '<h2 className="text-2xl font-bold tracking-tight">IMPROVEMENT NOTICES</h2>',
        '<h2 className="text-2xl font-bold tracking-tight uppercase">{t("notices.title")}</h2>'
    ),
    (
        'frontend/src/app/officer/notices/page.tsx',
        '<TableHead>Notice ID</TableHead>',
        '<TableHead>{t("notices.noticeId")}</TableHead>'
    ),
    (
        'frontend/src/app/officer/notices/page.tsx',
        '<TableHead>Inspection ID</TableHead>',
        '<TableHead>{t("notices.inspectionId")}</TableHead>'
    ),
    (
        'frontend/src/app/officer/notices/page.tsx',
        '<TableHead>Violations</TableHead>',
        '<TableHead>{t("notices.violations")}</TableHead>'
    ),
    (
        'frontend/src/app/officer/notices/page.tsx',
        '<TableHead>Status</TableHead>',
        '<TableHead>{t("common.status")}</TableHead>'
    ),
    (
        'frontend/src/app/officer/notices/page.tsx',
        '<TableHead className="text-right">Action</TableHead>',
        '<TableHead className="text-right">{t("common.action")}</TableHead>'
    ),
    (
        'frontend/src/app/officer/notices/page.tsx',
        '>View<',
        '>{t("common.view")}<'
    ),
    (
        'frontend/src/app/officer/notices/page.tsx',
        '>Approve<',
        '>{t("notices.approve")}<'
    ),
    (
        'frontend/src/app/officer/notices/page.tsx',
        '>Schedule Re-inspection<',
        '>{t("notices.schedule")}<'
    ),
    (
        'frontend/src/app/officer/notices/page.tsx',
        '{n.status}',
        '{t("status." + n.status)}'
    ),

    # ENFORCEMENT
    (
        'frontend/src/app/officer/enforcement/page.tsx',
        'export default function LegalDocket() {',
        'import { useTranslation } from "@/i18n"\n\nexport default function LegalDocket() {\n    const { t } = useTranslation()'
    ),
    (
        'frontend/src/app/officer/enforcement/page.tsx',
        '<h2 className="text-2xl font-bold tracking-tight">LEGAL DOCKET & ENFORCEMENT</h2>',
        '<h2 className="text-2xl font-bold tracking-tight uppercase">{t("enforcement.title")}</h2>'
    ),
    (
        'frontend/src/app/officer/enforcement/page.tsx',
        '<TableHead>Case ID</TableHead>',
        '<TableHead>{t("enforcement.caseId")}</TableHead>'
    ),
    (
        'frontend/src/app/officer/enforcement/page.tsx',
        '<TableHead>Product</TableHead>',
        '<TableHead>{t("enforcement.product")}</TableHead>'
    ),
    (
        'frontend/src/app/officer/enforcement/page.tsx',
        '<TableHead>Status</TableHead>',
        '<TableHead>{t("common.status")}</TableHead>'
    ),
    (
        'frontend/src/app/officer/enforcement/page.tsx',
        '{c.status}',
        '{t("status." + c.status)}'
    ),
    (
        'frontend/src/app/officer/enforcement/page.tsx',
        '>Begin Review<',
        '>{t("enforcement.startReview")}<'
    ),
    (
        'frontend/src/app/officer/enforcement/page.tsx',
        '>Issue Penalty<',
        '>{t("enforcement.issuePenalty")}<'
    ),
    (
        'frontend/src/app/officer/enforcement/page.tsx',
        '>Mark Resolved<',
        '>{t("enforcement.markResolved")}<'
    ),
    (
        'frontend/src/app/officer/enforcement/page.tsx',
        'View Audit',
        '{t("common.view")} Audit'
    ),

    # E-COMMERCE
    (
        'frontend/src/app/officer/ecommerce/page.tsx',
        'export default function EcomMonitor() {',
        'import { useTranslation } from "@/i18n"\n\nexport default function EcomMonitor() {\n    const { t } = useTranslation()'
    ),
    (
        'frontend/src/app/officer/ecommerce/page.tsx',
        '<h2 className="text-2xl font-bold tracking-tight">E-COMMERCE AUTO MONITOR</h2>',
        '<h2 className="text-2xl font-bold tracking-tight uppercase">{t("ecommerce.title")}</h2>'
    ),
    (
        'frontend/src/app/officer/ecommerce/page.tsx',
        '>Add Monitor<',
        '>{t("ecommerce.addMonitor")}<'
    ),
    (
        'frontend/src/app/officer/ecommerce/page.tsx',
        '>Product URL<',
        '>{t("ecommerce.productUrl")}<'
    ),
    (
        'frontend/src/app/officer/ecommerce/page.tsx',
        '<TableHead>Status</TableHead>',
        '<TableHead>{t("ecommerce.crawlerStatus")}</TableHead>'
    ),
    (
        'frontend/src/app/officer/ecommerce/page.tsx',
        '>Scan Now<',
        '>{t("ecommerce.runScan")}<'
    ),
    (
        'frontend/src/app/officer/ecommerce/page.tsx',
        '>View<',
        '>{t("common.view")}<'
    ),

    # RE-INSPECTIONS
    (
        'frontend/src/app/officer/reinspections/page.tsx',
        'export default function Reinspections() {',
        'import { useTranslation } from "@/i18n"\n\nexport default function Reinspections() {\n    const { t } = useTranslation()'
    ),
    (
        'frontend/src/app/officer/reinspections/page.tsx',
        '<h2 className="text-2xl font-bold tracking-tight">RE-INSPECTION QUEUE</h2>',
        '<h2 className="text-2xl font-bold tracking-tight uppercase">{t("reinspections.title")}</h2>'
    ),
    (
        'frontend/src/app/officer/reinspections/page.tsx',
        '>Due Date<',
        '>{t("reinspections.dueDate")}<'
    ),
    (
        'frontend/src/app/officer/reinspections/page.tsx',
        '>Original Notice<',
        '>{t("reinspections.originalNotice")}<'
    ),
    (
        'frontend/src/app/officer/reinspections/page.tsx',
        '>Start Re-inspection<',
        '>{t("reinspections.start")}<'
    ),

    # MANUFACTURER DASHBOARD
    (
        'frontend/src/app/manufacturer/dashboard/page.tsx',
        'export default function ManufacturerDashboard() {',
        'import { useTranslation } from "@/i18n"\n\nexport default function ManufacturerDashboard() {\n    const { t } = useTranslation()'
    ),
    (
        'frontend/src/app/manufacturer/dashboard/page.tsx',
        '<h2 className="text-2xl font-bold tracking-tight">Manufacturer Dashboard</h2>',
        '<h2 className="text-2xl font-bold tracking-tight">{t("manufacturer.title")}</h2>'
    ),
    (
        'frontend/src/app/manufacturer/dashboard/page.tsx',
        '>Notice ID<',
        '>{t("notices.noticeId")}<'
    ),
    (
        'frontend/src/app/manufacturer/dashboard/page.tsx',
        '>Deadline<',
        '>{t("manufacturer.deadline")}<'
    ),
    (
        'frontend/src/app/manufacturer/dashboard/page.tsx',
        '>Submit Rectification<',
        '>{t("manufacturer.submit")}<'
    ),
    (
        'frontend/src/app/manufacturer/dashboard/page.tsx',
        '{n.status}',
        '{t("status." + n.status)}'
    ),

    # ADMIN RULES
    (
        'frontend/src/app/admin/rules/page.tsx',
        'export default function RuleManagement() {',
        'import { useTranslation } from "@/i18n"\n\nexport default function RuleManagement() {\n    const { t } = useTranslation()'
    ),
    (
        'frontend/src/app/admin/rules/page.tsx',
        '<h2 className="text-2xl font-bold tracking-tight">Rules Management</h2>',
        '<h2 className="text-2xl font-bold tracking-tight">{t("admin.rulesManagement")}</h2>'
    ),
    (
        'frontend/src/app/admin/rules/page.tsx',
        '>Rule ID<',
        '>{t("admin.ruleId")}<'
    ),
    (
        'frontend/src/app/admin/rules/page.tsx',
        '>Requirement Name<',
        '>{t("admin.ruleName")}<'
    ),
    (
        'frontend/src/app/admin/rules/page.tsx',
        '>Category<',
        '>{t("admin.category")}<'
    ),
    (
        'frontend/src/app/admin/rules/page.tsx',
        '>Create Rule<',
        '>{t("admin.createRule")}<'
    ),
    (
        'frontend/src/app/admin/rules/page.tsx',
        '>Save Rule<',
        '>{t("admin.saveRule")}<'
    )
]

for file_path in FILES:
    if not os.path.exists(file_path):
        print(f"Not found: {file_path}")
        continue
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    for path, target, replacement in REPLACEMENTS:
        if path == file_path:
            content = content.replace(target, replacement)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Processed: {file_path}")
