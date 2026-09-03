class DemoData {
  static const Map<String, dynamic> stats = {
    'inspectionsToday': 12,
    'pendingReinspections': 3,
    'highRiskCases': 2,
  };

  static const List<Map<String, dynamic>> priorityCases = [
    {
      'id': 'PC-101',
      'product': 'Aquafina 1L',
      'manufacturer': 'PepsiCo India',
      'risk': 'HIGH',
      'riskScore': 85,
      'location': 'Mumbai Hub',
    },
    {
      'id': 'PC-102',
      'product': 'Lays Classic 50g',
      'manufacturer': 'PepsiCo India',
      'risk': 'MEDIUM',
      'riskScore': 60,
      'location': 'Delhi Hub',
    }
  ];
}