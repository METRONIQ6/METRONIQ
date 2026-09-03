# Evidence Viewer Architecture & UX

One of MetronIQ’s strongest UI priorities is the **Evidence Viewer**, designed to explicitly link AI extraction output to deterministic legal decisions.

## Visual Flow & Architecture

The Evidence Viewer sits directly inside the Compliance Result screen. It visually anchors the user to exactly **what happened**.

```text
┌──────────────────────────────────────────────┐
│                                              │
│                PACKAGE IMAGE                 │
│                                              │
│   [   Highlighted Evidence Region Crop   ]   │
│                                              │
│                                              │
└──────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────┐
│ Detected Field:     MRP                      │
│ Extracted Value:    ₹50                      │
│ OCR Source Text:    "MRP R 50.00"            │
│ AI Confidence:      [ 96% Badge ]            │
└──────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────┐
│ Applicable Rule:    RULE-001 (Packaged Com.) │
│ Version Verified:   v3                       │
│ Rule Requirement:   MRP Declaration Required │
└──────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────┐
│ Compliance Decision:[ PASS Status Badge ]    │
└──────────────────────────────────────────────┘
```

## Key Interactions
- **Cropping & Panning:** Clicking the "Highlighted Evidence Region" expands a modal showing the exact bounding-box coordinates computed by the CV model.
- **Traceability:** Clicking the "Applicable Rule" redirects Admin/Officer immediately to the Rule Control Simulator to view exactly how that rule processed that field.
- **AI Explanation:** In FAIL states, an AI text block sits below this viewer reading the JSON data above and converting it into natural language (e.g. *"The label failed because while MRP was detected as '₹50' with 96% confidence, Rule 001/v3 mandates standard formatting."*).
