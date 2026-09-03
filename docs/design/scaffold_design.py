import os

base_path = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ"
docs_design_path = os.path.join(base_path, "docs", "design")
os.makedirs(docs_design_path, exist_ok=True)

files = {
    "design-system.md": """# MetronIQ Design System
The MetronIQ design system is a comprehensive guide to building a modern, government-grade, AI-powered compliance platform.

## Design Principles
1. Clarity over decoration
2. Function over visual noise
3. Evidence over vague AI claims
4. Explainability over black-box presentation
5. Fast field workflows
6. Consistent components
7. Accessibility
8. Responsive design
9. Professional government-tech appearance
""",
    "color-system.md": """# Color System

## Core palette
- **Primary**: Deep Navy (`#0A192F`)
- **Secondary**: Blue (`#1E3A8A`)
- **Background**: Very Light Neutral (`#F8FAFC`)
- **Surface**: White (`#FFFFFF`)
- **Text**: Dark Slate (`#334155`)
- **Muted Text**: Slate Gray (`#64748B`)

## Semantic/Status Colors
- **PASS** / **LOW RISK**: Green (`#10B981`)
- **REVIEW** / **MEDIUM RISK**: Amber (`#F59E0B`)
- **FAIL** / **HIGH RISK**: Red (`#EF4444`)

Avoid neon colors and excessive gradients. Use the system consistently through tokens.
""",
    "typography.md": """# Typography System

Using a modern professional sans-serif font (e.g., Inter or Roboto).

## Hierarchy
- **Display**: 48px / 3rem, Bold
- **H1**: 36px / 2.25rem, Semi-Bold
- **H2**: 24px / 1.5rem, Semi-Bold
- **H3**: 20px / 1.25rem, Medium
- **Body**: 16px / 1rem, Regular (Dark Slate text)
- **Small**: 14px / 0.875rem, Regular 
- **Caption**: 12px / 0.75rem, Regular (Slate Gray text)
- **Label**: 12px / 0.75rem, Medium, Uppercase (for metadata & tags)
""",
    "component-system.md": """# Component System

Standardized components to be built using Tailwind CSS and shadcn/ui.

## Core
- **Button, IconButton:** Primary (Navy), Outline, Ghost, Destructive.
- **Inputs & Forms:** Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, DatePicker, FileUpload, Search.
- **Layout & Navigation:** Tabs, Breadcrumb, Sidebar, TopBar, MobileBottomNavigation, CommandMenu.
- **Data Display:** Card, StatCard, Table, DataTable, Pagination, Avatar.
- **Feedback:** Badge, StatusBadge, RiskBadge, Modal, Drawer, Dropdown, Tooltip, Toast, Alert, EmptyState, LoadingState, ErrorState, ProgressBar, ProgressStepper, Timeline, ConfirmationDialog.

## Visual Styling
- **Spacing:** `xs, sm, md, lg, xl, 2xl, 3xl` (Tailwind defaults `p-2`, `p-4`, etc).
- **Border Radius:** Moderate rounded corners (`rounded-md`, `rounded-lg`). Avoiding excessive pill shapes.
- **Shadows:** Subtle shadows (`shadow-sm`, `shadow-md`), emphasizing surface boundaries.
""",
    "web-ux.md": """# Web UX Architecture

## Main Layout
- Left Sidebar (adaptive by role)
- Top Navigation (Profile, Notifications, status)
- Main Content Area (Responsive width, max-w-7xl)

## Dashboard Layout
- **Header:** Welcome text, system status.
- **Stats Row:** Inspections, High Risk Cases, Violations, Reinspections.
- **Main:** Priority Inspections queue (table with Risk, Product, Actions).
- **Trends:** Compliance Trend charts and Violation Distributions using Recharts.

## Responsive Strategy
- **Mobile (< 768px):** Hide sidebar, use hamburger menu. Tabular data transforms to stacked cards.
- **Tablet (768px - 1024px):** Condensed sidebar, stacked layouts fluidly scaling.
- **Desktop (>1024px):** Full layout, expansive data tables.
""",
    "mobile-ux.md": """# Mobile UX Architecture (Flutter)

Optimized for **Legal Metrology Field Officers**.

## Navigation
- Bottom Navigation Bar: Home, Inspect, Priority, History, Profile.

## Key Flows
- **Home → New Inspection:** Giant FAB or primary camera button.
- **Camera-first design:** Viewfinder immediately available upon tapping Inspect, supporting flash, toggle, and edge alignment guides.
- **Results Viewer:** Stacks vertically, displaying Evidence chips that are thumb-friendly (large touch targets).

## Principles
- **One-handed operation:** Critical actions reside in the lower third of the screen.
- **Minimal typing:** Rely on auto-extracted data and dropdowns.
- **Fast visual feedback:** High contrast PASS/REVIEW/FAIL screens for outdoor readability.
""",
    "compliance-ui.md": """# Compliance UI Elements

## Custom Components
- **ComplianceStatus:** Bold visual block declaring PASS/REVIEW/FAIL with corresponding semantic color background.
- **FindingCard:** Holds requirement vs observed value.
- **RuleTraceCard:** Visually connects Detection → Extracted Value → Rule → Version → Validation → Decision.
- **RuleVersionBadge:** e.g. `v3` linked to the current rule check.
- **ConfidenceBadge:** Indicator (e.g. `96% confidence`) for extraction reliability.
- **OCRField & DeclarationField:** Displays raw OCR next to mapped JSON entity.
- **RiskScoreCard:** Score, Level, and RiskFactorList explicitly explaining why the risk was assigned.

## Evidence Viewer
Provides clear spatial and contextual connection between an image and a decision.
""",
    "rule-control-ui.md": """# Rule Control Dashboard UI

## Layout
- **Top Stats:** Total Rules, Active, Draft, Pending, Updated.
- **Data Table:** Rule ID, Name, Category, Version, Date, Status, Actions.
- **Filters:** Extensive sidebar or drawer filters for category/status.

## Detail Page
- Divided vertically: Metadata → Version History → Audit History → Impact/Simulator.

## Rule Simulator
A clean testing sandbox clearly marked with `SIMULATION ONLY`.
- Inputs: Category selection, mock payload fields.
- CTA: `Test Rule`.
- Output: Rendered `ComplianceStatus`, `FindingCard`, and Rule Trace matching the production UI experience.
""",
    "inspection-flow.md": """# New Inspection Flow (Web)

```mermaid
flowchart TD
    A[New Inspection] --> B[Select/Enter Product]
    B --> C[Capture/Upload Image]
    C --> D{Image Quality Check}
    D -->|Fail| E[Show Error: Retake]
    E --> C
    D -->|Pass| F[Scanning State]
    F --> G[Extracted Declarations]
    G --> H[Compliance Result]
    H --> I[Evidence & Rule Trace Review]
    I --> J[Save / Issue Notice]
```

## Scanner State UI
Uses a progress stepper without fake animations:
- [x] Analyzing Image
- [x] Text Detection
- [ ] Declaration Extraction (spinner)
- [ ] Rule Evaluation
- [ ] Result
""",
    "accessibility.md": """# Accessibility Strategy

MetronIQ must maintain strict Web Content Accessibility Guidelines (WCAG) compliance.

- **Keyboard Navigation:** Forms, DataTables, and actions must be fully reachable via Tab/Shift+Tab. Focus states must have high-contrast rings (e.g., `ring-2 ring-blue-500`).
- **Semantic HTML & ARIA:** Use correct `nav`, `main`, `article` tags. Dialogs and modals must trap focus and announce appropriately.
- **Color Independence:** Do not rely purely on color to indicate status. A PASS needs a checkmark icon, FAIL needs an X icon, along with text labels.
- **Contrast Ratios:** Ensure Deep Navy and Slate Gray text against white/neutral backgrounds meets contrast requirements (4.5:1 minimum).
"""
}

for filename, content in files.items():
    with open(os.path.join(docs_design_path, filename), "w", encoding="utf-8") as f:
        f.write(content)

print("Design docs scaffold complete.")
