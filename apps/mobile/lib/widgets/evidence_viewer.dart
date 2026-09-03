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
                        '✨ AI-ASSISTED EXPLANATION:\n\nThe label failed compliance because the contact information extracted lacks the mandatory email mapping per Rule 001 v1.2.',
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