# Web Architecture (Next.js)

The web dashboard is the main command center for Admins, Manufacturers, and back-office Officers.

## Tech Stack
- **Framework:** Next.js (App Router).
- **Styling UI:** Tailwind CSS, shadcn/ui.
- **Charts:** Recharts for Smart Enforcement Dashboard.

## Route & Permission Matrix

| Route | Purpose | Officer | Manufacturer | Admin |
|-------|---------|---------|--------------|-------|
| `/login` | Public Authentication | Yes | Yes | Yes |
| `/dashboard` | Main Stats & Trends | Yes | Limited | Yes |
| `/inspections` | Inspection Logs | Yes | Own | Yes |
| `/scanner` | Manual UI for PC scan | Yes | Own | Yes |
| `/rules` | Rule Control Dashboard | View | Limited | Manage |
| `/risk` | Target Prioritization | Yes | No | Yes |
| `/ecommerce`| Online compliance scans | Yes | No | Yes |
| `/admin/settings` | RBAC & Config | No | No | Yes |

## Page Hierarchy & Layout
- **Layout wrapper:** Injects Sidebar (filtered by user Role claim), Authentication provider, and global Toast notifications.
- **Data Fetching:** Standard `SWR` or React Query interacting with the FastAPI endpoints, utilizing Bearer token fetched from cookies/local storage.
