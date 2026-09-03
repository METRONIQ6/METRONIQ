# Compliance Rule Engine Architecture

The core tenet of the Rule Engine is **Determinism**. An LLM will never output "pass" or "fail". The AI acts as a sophisticated visual parser, leaving the legal decision to structured code.

## Architecture

1. **Input Payload**: The Categorization service identifies the product (e.g. `PACKAGED_WATER`).
2. **Rule Fetch**: The Compliance Engine queries the Database for all `RULE_VERSIONS` where `status = ACTIVE` and `product_category = PACKAGED_WATER` (or global).
3. **Execution**: The deterministic engine loops through the active rules applying the `validation_logic` against the `DECLARATIONS` payload.

**Example Logic Structure:**
```json
{
  "rule_name": "Net Quantity Minimum Height",
  "conditions": { "target_field": "net_quantity" },
  "validation_logic": {
    "operator": ">=",
    "parameter": "2mm" 
  }
}
```

## AI Explanation Layer
If a rule triggers a **FAIL**, the deterministic engine saves the physical evidence and metadata:
- Extracted net quantity: "1.5mm"
- Required net quantity: ">=2mm"
- Rule ID: RV-9912

The **AI Explanation Layer** receives this structured packet and generates human readable context:
> "The label fails compliance because the registered Net Quantity font height is 1.5mm. Under Rule RV-9912 (Legal Metrology Packaged Commodities Rules), the minimum acceptable height for this package category is 2mm. Ensure you are using the correct typography dimensions in your next rectification."
