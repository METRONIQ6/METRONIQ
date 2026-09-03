# Compliance UI Elements

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
