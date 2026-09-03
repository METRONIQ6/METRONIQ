import 'package:flutter/material.dart';
import 'compliance_result_screen.dart';
import '../../core/theme/app_colors.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  int _currentStep = 0;

  @override
  void initState() {
    super.initState();
    _simulateScan();
  }

  void _simulateScan() async {
    for (int i = 0; i <= 4; i++) {
      await Future.delayed(const Duration(milliseconds: 800));
      if (mounted) setState(() => _currentStep = i);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Analysis')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 200,
              width: double.infinity,
              color: Colors.grey.shade300,
              child: const Center(child: Text('[ Captured Image Preview ]')),
            ),
            const SizedBox(height: 32),
            const Text('Processing Pipeline', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            _buildStep('Image Quality', 1),
            _buildStep('Text Detection (OCR)', 2),
            _buildStep('Declaration Extraction', 3),
            _buildStep('Rule Evaluation', 4),
            
            const Spacer(),
            if (_currentStep == 4)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const ComplianceResultScreen()));
                  },
                  child: const Text('VIEW RESULT'),
                ),
              )
          ],
        ),
      ),
    );
  }

  Widget _buildStep(String title, int stepIndex) {
    bool isCompleted = _currentStep >= stepIndex;
    bool isActive = _currentStep == stepIndex - 1;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(
            isCompleted ? Icons.check_circle : (isActive ? Icons.circle_outlined : Icons.circle),
            color: isCompleted ? AppColors.passGreen : (isActive ? AppColors.blueAccent : Colors.grey),
          ),
          const SizedBox(width: 12),
          Text(title, style: TextStyle(fontWeight: isActive ? FontWeight.bold : FontWeight.normal, color: isCompleted ? AppColors.textMain : Colors.grey)),
        ],
      ),
    );
  }
}