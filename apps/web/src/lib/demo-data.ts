export const demoStats = {
  inspectionsToday: 142,
  highRiskCases: 12,
  openViolations: 45,
  pendingReinspections: 8,
};

export const demoInspections = [
  { id: "INSP-001", priority: 1, product: "Aquafina 1L", category: "Packaged Water", manufacturer: "PepsiCo India", location: "Mumbai Hub", risk: "HIGH", riskScore: 85, status: "FAIL", date: "2026-08-29" },
  { id: "INSP-002", priority: 2, product: "Lays Classic 50g", category: "Snacks", manufacturer: "PepsiCo India", location: "Delhi Hub", risk: "MEDIUM", riskScore: 60, status: "REVIEW", date: "2026-08-29" },
  { id: "INSP-003", priority: 3, product: "Nestle Cerelac", category: "Baby Food", manufacturer: "Nestle India", location: "Pune Hub", risk: "LOW", riskScore: 20, status: "PASS", date: "2026-08-28" },
  { id: "INSP-004", priority: 1, product: "Parle-G 250g", category: "Biscuits", manufacturer: "Parle Products", location: "Chennai Hub", risk: "HIGH", riskScore: 78, status: "FAIL", date: "2026-08-28" },
];

export const complianceTrendData = [
  { name: 'Mon', pass: 120, fail: 15, review: 5 },
  { name: 'Tue', pass: 140, fail: 12, review: 8 },
  { name: 'Wed', pass: 135, fail: 18, review: 10 },
  { name: 'Thu', pass: 150, fail: 10, review: 4 },
  { name: 'Fri', pass: 110, fail: 22, review: 15 },
  { name: 'Sat', pass: 80, fail: 5, review: 2 },
  { name: 'Sun', pass: 90, fail: 8, review: 3 },
];

export const violationDistributionData = [
  { name: 'Missing MRP', value: 400 },
  { name: 'Net Qty Font Size', value: 300 },
  { name: 'Missing Date', value: 300 },
  { name: 'Contact Info', value: 200 },
];

export const demoRules = [
  { id: "RULE-DEMO-001", name: "MRP Declaration Required", category: "Global", version: "v4.0", effectiveDate: "2024-01-01", status: "ACTIVE", updated: "2026-05-12" },
  { id: "RULE-DEMO-002", name: "Net Quantity Minimum Font Height", category: "Global", version: "v2.1", effectiveDate: "2025-06-15", status: "ACTIVE", updated: "2026-01-10" },
  { id: "RULE-DEMO-003", name: "Baby Food Warning Label", category: "Baby Food", version: "v1.2", effectiveDate: "2026-01-01", status: "DRAFT", updated: "2026-08-20" }
];