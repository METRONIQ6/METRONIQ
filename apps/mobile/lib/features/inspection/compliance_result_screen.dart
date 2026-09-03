import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../widgets/evidence_viewer.dart';

class ComplianceResultScreen extends StatelessWidget {
  const ComplianceResultScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Compliance Result')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.failRed,
                borderRadius: BorderRadius.circular(8)
              ),
              child: const Column(
                children: [
                  Icon(Icons.cancel_outlined, color: Colors.white, size: 48),
                  SizedBox(height: 8),
                  Text('FAIL', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text('Findings', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Consumer Care Information', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 4),
                    const Text('Required declaration missing or illegible.', style: TextStyle(color: AppColors.failRed, fontWeight: FontWeight.bold)),
                  ]
                )
              )
            ),
            
            const SizedBox(height: 24),
            const Text('Evidence & Rule Trace', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const EvidenceViewer(),

            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.failRed),
              child: const Text('START CORRECTIVE WORKFLOW'),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () {
                Navigator.of(context).popUntil((route) => route.isFirst);
              },
              child: const Text('SAVE INSPECTION (OFFLINE SYNC)'),
            )
          ],
        ),
      ),
    );
  }
}