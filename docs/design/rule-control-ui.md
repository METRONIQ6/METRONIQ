# Rule Control Dashboard UI

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
