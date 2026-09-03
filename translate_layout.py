import os

FILE = 'frontend/src/components/layout/DashboardLayout.tsx'

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
if 'import { useTranslation } from "@/i18n"' not in content:
    content = content.replace("import Link from 'next/link'", "import Link from 'next/link'\nimport { useTranslation } from \"@/i18n\"")

# 2. Modify nav getters to accept t
content = content.replace("const getOfficerNav = () => [", "const getOfficerNav = (t: any) => [")
content = content.replace("const getAdminNav = () => [", "const getAdminNav = (t: any) => [")
content = content.replace("const getManufacturerNav = () => [", "const getManufacturerNav = (t: any) => [")

# 3. Translate Officer keys
content = content.replace("{ name: 'Dashboard', href: '/officer/dashboard', icon: LayoutDashboard },", "{ name: t('navigation.dashboard'), href: '/officer/dashboard', icon: LayoutDashboard },")
content = content.replace("{ name: 'AI Scanner', href: '/officer/scanner', icon: ScanLine },", "{ name: t('navigation.aiScanner'), href: '/officer/scanner', icon: ScanLine },")
content = content.replace("{ name: 'E-Commerce Monitor', href: '/officer/ecommerce', icon: Globe },", "{ name: t('navigation.ecommerce'), href: '/officer/ecommerce', icon: Globe },")
content = content.replace("{ name: 'Legal Docket', href: '/officer/enforcement', icon: Scale },", "{ name: t('navigation.enforcement'), href: '/officer/enforcement', icon: Scale },")
content = content.replace("{ name: 'Re-inspection', href: '/officer/reinspections', icon: RefreshCw },", "{ name: t('navigation.reinspections'), href: '/officer/reinspections', icon: RefreshCw },")
content = content.replace("{ name: 'Notices', href: '/officer/notices', icon: FileText },", "{ name: t('navigation.notices'), href: '/officer/notices', icon: FileText },")
content = content.replace("{ name: 'Audit Reports', href: '/officer/reports', icon: BarChart3 }", "{ name: t('navigation.reports'), href: '/officer/reports', icon: BarChart3 }")

# 4. Translate Admin keys
content = content.replace("{ name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },", "{ name: t('navigation.dashboard'), href: '/admin/dashboard', icon: LayoutDashboard },")
content = content.replace("{ name: 'Geo Analytics', href: '/admin/geo', icon: Map },", "{ name: t('navigation.geoAnalytics'), href: '/admin/geo', icon: Map },")
content = content.replace("{ name: 'Rule Management', href: '/admin/rules', icon: Ruler },", "{ name: t('navigation.rules'), href: '/admin/rules', icon: Ruler },")

# 5. Translate Manufacturer keys
content = content.replace("{ name: 'Dashboard', href: '/manufacturer/dashboard', icon: LayoutDashboard },", "{ name: t('navigation.dashboard'), href: '/manufacturer/dashboard', icon: LayoutDashboard },")
content = content.replace("{ name: 'Label Auditor', href: '/manufacturer/auditor', icon: FileSearch },", "{ name: t('navigation.labelAuditor'), href: '/manufacturer/auditor', icon: FileSearch },")

# 6. Inject t inside component
if 'const { t } = useTranslation()' not in content:
    content = content.replace("const [copilotOpen, setCopilotOpen] = useState(false)", "const [copilotOpen, setCopilotOpen] = useState(false)\n    const { t } = useTranslation()")

# 7. Update navItems calls
content = content.replace("let navItems = getOfficerNav()", "let navItems = getOfficerNav(t)")
content = content.replace("if (role === 'admin') navItems = getAdminNav()", "if (role === 'admin') navItems = getAdminNav(t)")
content = content.replace("if (role === 'manufacturer') navItems = getManufacturerNav()", "if (role === 'manufacturer') navItems = getManufacturerNav(t)")

# 8. Update JSX hardcodes
content = content.replace(">Logout<", ">{t('common.logout')}<")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("Layout updated.")
