# New Inspection Flow (Web)

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
