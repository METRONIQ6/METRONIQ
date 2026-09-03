# Web UX Architecture

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
