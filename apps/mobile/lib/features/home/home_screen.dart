import 'package:flutter/material.dart';
import '../../core/constants/demo_data.dart';
import '../../core/theme/app_colors.dart';
import '../inspection/new_inspection_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Good morning, Officer', style: TextStyle(fontSize: 18)),
        actions: [
          IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Stats Row
            Row(
              children: [
                Expanded(child: _buildStatCard('Today', DemoData.stats['inspectionsToday'].toString(), Icons.check_circle_outline, AppColors.passGreen)),
                const SizedBox(width: 8),
                Expanded(child: _buildStatCard('Recheck', DemoData.stats['pendingReinspections'].toString(), Icons.refresh, AppColors.reviewAmber)),
                const SizedBox(width: 8),
                Expanded(child: _buildStatCard('Risk', DemoData.stats['highRiskCases'].toString(), Icons.warning_amber_rounded, AppColors.failRed)),
              ],
            ),
            const SizedBox(height: 24),
            
            // CTA
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const NewInspectionScreen()));
              },
              icon: const Icon(Icons.add_a_photo),
              label: const Text('NEW INSPECTION'),
            ),
            const SizedBox(height: 24),

            // Priority Cases
            const Text('Priority Cases', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textMain)),
            const SizedBox(height: 12),
            ...DemoData.priorityCases.map((caseData) => _buildPriorityCard(caseData)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.textMain)),
            Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
          ],
        ),
      ),
    );
  }

  Widget _buildPriorityCard(Map<String, dynamic> data) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Container(
          width: 8,
          color: data['risk'] == 'HIGH' ? AppColors.failRed : AppColors.reviewAmber,
        ),
        title: Text(data['product'], style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('${data['manufacturer']} • ${data['location']}'),
        trailing: const Icon(Icons.chevron_right),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16),
      ),
    );
  }
}