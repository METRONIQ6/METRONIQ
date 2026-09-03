# Accessibility Strategy

MetronIQ must maintain strict Web Content Accessibility Guidelines (WCAG) compliance.

- **Keyboard Navigation:** Forms, DataTables, and actions must be fully reachable via Tab/Shift+Tab. Focus states must have high-contrast rings (e.g., `ring-2 ring-blue-500`).
- **Semantic HTML & ARIA:** Use correct `nav`, `main`, `article` tags. Dialogs and modals must trap focus and announce appropriately.
- **Color Independence:** Do not rely purely on color to indicate status. A PASS needs a checkmark icon, FAIL needs an X icon, along with text labels.
- **Contrast Ratios:** Ensure Deep Navy and Slate Gray text against white/neutral backgrounds meets contrast requirements (4.5:1 minimum).
