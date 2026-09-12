import re

with open('frontend/src/app/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

patch = """
import { useTranslation } from '@/i18n';
import LanguageSelector from '@/components/LanguageSelector';
"""

if 'useTranslation' not in code:
    code = code.replace("import { useRouter } from 'next/navigation';",
"import { useRouter } from 'next/navigation';\n" + patch)

    code = code.replace("export default function LandingPage() {",
"export default function LandingPage() {\n    const { t } = useTranslation();")

# Navbar
code = code.replace("Department Login", "{t('landing.departmentLogin')}")

# add LanguageSelector in navbar
code = code.replace("<Button onClick={() => router.push('/login')}",
"<LanguageSelector />\n                        <Button onClick={() => router.push('/login')}")

# Hero
code = code.replace('Legal Metrology Compliance. <br className="hidden md:block" />',
'{t(\'landing.title1\')} <br className="hidden md:block" />')

code = code.replace('Automated by AI.', "{t('landing.title2')}")

code = code.replace("""The official centralized intelligence platform for state enforcement directorates. From instant field AI scanning and e-commerce oversight to dynamic rule mapping, reinspections, and financial penalties—one unified platform governing consumer protection.""",
"{t('landing.subtitle')}")

code = code.replace('Access Govt Portal', "{t('landing.accessGovtPortal')}")

# Workflows
code = code.replace('Standard Operating Procedure', "{t('landing.sop')}")
code = code.replace('The Complete Enforcement Lifecycle', "{t('landing.sopTitle')}")
code = code.replace('MetronIQ eliminates siloed physical paperwork. A completely closed-loop environment where every action is intelligently tracked across the regulatory continuum.', "{t('landing.sopDesc')}")

code = code.replace('title: "AI Package Scanner"', "title: t('landing.aiScanner')")
code = code.replace('desc: "Officers upload packaging imagery; AI extracts OCR tokens and instantly validates them against active Legal Metrology (LMPC) Rules."', "desc: t('landing.aiScannerDesc')")

code = code.replace('title: "Improvement Notices"', "title: t('landing.improvementNotices')")
code = code.replace('desc: "Automated digital notice generation demanding rectification from Manufacturers. All corporate responses tracked officially."', "desc: t('landing.improvementNoticesDesc')")

code = code.replace('title: "Reinspections"', "title: t('landing.reinspections')")
code = code.replace('desc: "After notices expire, dynamic scheduling triggers follow-up compliance checks. Unresolved issues escalate automatically."', "desc: t('landing.reinspectionsDesc')")

code = code.replace('title: "Penalty Enforcement"', "title: t('landing.penaltyEnforcement')")
code = code.replace('desc: "Escalated violations shift to legal dockets, allowing transparent issuance of financial penalties & compound mandates to offenders."', "desc: t('landing.penaltyEnforcementDesc')")

# Core modules
code = code.replace('Enterprise Modules & Capabilities', "{t('landing.enterpriseModules')}")
code = code.replace('A vast operational framework designed for government scale—bridging administrators, field officers, and enterprise manufacturers seamlessly across India under a unified regulatory umbrella.', "{t('landing.enterpriseModulesDesc')}")

code = code.replace('title: "AI Inference & OCR"', "title: t('landing.aiInference')")
code = code.replace('subtitle: "Field Object Detection"', "subtitle: t('landing.aiInferenceSub')")
code = code.replace('desc: "Custom AI models extract text and specifications from physical packaged commodities in real-time to highlight unregistered configurations."', "desc: t('landing.aiInferenceDesc')")

code = code.replace('title: "Dynamic Rules Engine"', "title: t('landing.dynamicRules')")
code = code.replace('subtitle: "Statutory Law Mapping"', "subtitle: t('landing.dynamicRulesSub')")
code = code.replace('desc: "Administer and rigidly version Legal Metrology specifications. Update legal limits natively within the portal to dynamically calibrate AI field inspections."', "desc: t('landing.dynamicRulesDesc')")

code = code.replace('title: "Manufacturer Rectification"', "title: t('landing.mfgRectification')")
code = code.replace('subtitle: "Corporate Compliance"', "subtitle: t('landing.mfgRectificationSub')")
code = code.replace('desc: "Secured Manufacturer portals allowing verified businesses to view flagged product notices, submit appeals, and provide proof-of-compliance independently."', "desc: t('landing.mfgRectificationDesc')")

code = code.replace('title: "Geospatial Analytics"', "title: t('landing.geoAnalytics')")
code = code.replace('subtitle: "Risk-Based Heatmaps"', "subtitle: t('landing.geoAnalyticsSub')")
code = code.replace('desc: "Map interfaces rendering real-time heatmaps of systemic violations across regional territories, assisting state officers in prioritizing physical deployment."', "desc: t('landing.geoAnalyticsDesc')")

code = code.replace('title: "Multilingual Intelligence"', "title: t('landing.multilingual')")
code = code.replace('subtitle: "Vernacular Support"', "subtitle: t('landing.multilingualSub')")
code = code.replace('desc: "Context-aware operational localization. Switch effortlessly between English, Tamil, and Hindi without reloading, ensuring absolute usability across field agents."', "desc: t('landing.multilingualDesc')")

code = code.replace('title: "Automated PDF Ledger"', "title: t('landing.pdfLedger')")
code = code.replace('subtitle: "Official Audit Trail"', "subtitle: t('landing.pdfLedgerSub')")
code = code.replace('desc: "One-click audit ledger extraction. Generate verified, government-standard banded timeline reports, securely authorized and exportable via JWT credentials."', "desc: t('landing.pdfLedgerDesc')")

# Visual 
code = code.replace('Legal Metrology & Food Safety Operations', "{t('landing.legalOps')}")
code = code.replace('Engineered exclusively for government enforcement directorates, ensuring statutory compliance, packaged commodity governance, and rigorous consumer protection across the supply chain.', "{t('landing.legalOpsDesc')}")

code = code.replace('text: "Role-Based Access Control"', "text: t('landing.rbac')")
code = code.replace('text: "Immutable Audit Trails"', "text: t('landing.immutableAudit')")
code = code.replace('text: "Session State Management"', "text: t('landing.sessionState')")
code = code.replace('text: "Deterministic Validation"', "text: t('landing.deterministicVal')")

code = code.replace('Authenticate Module', "{t('landing.authenticateModule')}")

code = code.replace('Official Regulatory Audit Stream', "{t('landing.auditStream')}")
code = code.replace('Secure Govt Node', "{t('landing.secureGovtNode')}")

code = code.replace('All operations securely logged.', "{t('landing.footer2')}")

with open('frontend/src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
