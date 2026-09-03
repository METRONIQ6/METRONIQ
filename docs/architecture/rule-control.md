# Rule Control Dashboard Architecture

The Rule Control Dashboard is a deeply integrated first-class module allowing Admins to manage the legal rules without touching backend code.

## Lifecycle
`DRAFT → REVIEW → APPROVED → ACTIVE → RETIRED`

- Existing active rules are **locked**. 
- To change a rule, the Admin clicks "Edit", which spawns a new `DRAFT` version with `version = N+1`.
- Once verified, the Admin hits "Activate", which flips the new version to `ACTIVE` and the old version to `RETIRED`.

## Rule Simulator
Because rules dynamically trigger legal actions (Notices/Violations), deploying them without a test is dangerous.
The **Rule Simulator** is a dedicated sandbox component:
1. Admin opens a DRAFT rule.
2. Admin pastes mock extracted payload (JSON output from the CV stage).
3. The Simulator runs the Deterministic Engine on the mock payload matching *only* that draft rule.
4. Admin visualizes if the rule correctly PASSES or FAILS before approving it.
