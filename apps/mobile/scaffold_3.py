import os

base = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\apps\mobile"
files = {}

files["lib/features/inspection/compliance_result_screen.dart"] = """
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
"""

files["lib/widgets/evidence_viewer.dart"] = """
import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';

class EvidenceViewer extends StatelessWidget {
  const EvidenceViewer({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(8),
        color: Colors.white
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Simulated Crop
          Container(
            height: 120,
            color: Colors.grey.shade200,
            child: Stack(
              children: [
                const Center(child: Text('[ Original Package Image ]')),
                Center(
                  child: Container(
                    width: 100,
                    height: 40,
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.reviewAmber, width: 2),
                      color: AppColors.reviewAmber.withOpacity(0.2)
                    ),
                  )
                )
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildRow('Detected:', 'Consumer Care Information'),
                _buildRow('Confidence:', '91% (Flagged for Review)', isAlert: true),
                const Divider(),
                _buildRow('Rule:', 'RULE-DEMO-001 (v1.2)'),
                const Divider(),
                ExpansionTile(
                  title: const Text('WHY WAS THIS FLAGGED?', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.blueAccent)),
                  tilePadding: EdgeInsets.zero,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      color: AppColors.background,
                      child: const Text(
                        '✨ AI-ASSISTED EXPLANATION:\\n\\nThe label failed compliance because the contact information extracted lacks the mandatory email mapping per Rule 001 v1.2.',
                        style: TextStyle(fontSize: 13)
                      )
                    )
                  ],
                )
              ],
            ),
          )
        ],
      )
    );
  }

  Widget _buildRow(String label, String value, {bool isAlert = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 13)),
          Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isAlert ? AppColors.reviewAmber : AppColors.textMain)),
        ],
      ),
    );
  }
}
"""

for file_path, content in files.items():
    full_path = os.path.join(base, file_path.replace("/", "\\"))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
