import os

base = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\apps\web\src"
files = {}

basic_page_template = """
export default function Page() {
  return (
    <div className="flex flex-col space-y-8 max-w-7xl mx-auto h-[70vh] items-center justify-center text-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-b pb-4 mb-4 uppercase tracking-wider">{title}</h1>
        <p className="text-slate-500 max-w-lg mx-auto">This structural shell page is successfully instantiated. Complex UI logic will be injected in later stages.</p>
        <span className="inline-block mt-6 px-4 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold tracking-widest uppercase">Stage 3 Demo Module</span>
      </div>
    </div>
  )
}
"""

pages = [
    ("app/inspections/page.tsx", "Inspections Directory"),
    ("app/inspections/new/page.tsx", "New Inspection Workflow"),
    ("app/label-auditor/page.tsx", "Label Auditor Center"),
    ("app/ecommerce/page.tsx", "E-Commerce Monitoring"),
    ("app/risk/page.tsx", "Risk Prioritization"),
    ("app/violations/page.tsx", "Violation Management"),
    ("app/reinspection/page.tsx", "Reinspection Control"),
    ("app/reports/page.tsx", "Report Generation"),
    ("app/manufacturers/page.tsx", "Manufacturer Index"),
    ("app/analytics/page.tsx", "Enforcement Analytics"),
    ("app/settings/page.tsx", "System Settings"),
]

for file_path, title in pages:
    full_path = os.path.join(base, file_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(basic_page_template.replace("{title}", title).strip())
