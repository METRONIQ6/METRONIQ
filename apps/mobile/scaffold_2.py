import os

base = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\apps\mobile"
files = {}

files["lib/features/home/home_screen.dart"] = """
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
"""

files["lib/features/inspection/new_inspection_screen.dart"] = """
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import 'camera_screen.dart';

class NewInspectionScreen extends StatelessWidget {
  const NewInspectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New Inspection')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Product Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Category', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: 'water', child: Text('Packaged Water')),
                DropdownMenuItem(value: 'snacks', child: Text('Snacks & Chips')),
              ],
              onChanged: (v) {},
            ),
            const SizedBox(height: 16),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Manufacturer Search', border: OutlineInputBorder(), prefixIcon: Icon(Icons.search)),
            ),
            const SizedBox(height: 16),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Product Name', border: OutlineInputBorder()),
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const CameraScreen()));
              },
              child: const Text('CONTINUE TO CAPTURE'),
            )
          ],
        ),
      ),
    );
  }
}
"""

files["lib/features/inspection/camera_screen.dart"] = """
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import 'scanner_screen.dart';

class CameraScreen extends StatelessWidget {
  const CameraScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Capture Package'),
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Stack(
        children: [
          // Simulated Viewfinder
          Center(
            child: Container(
              margin: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white.withOpacity(0.5), width: 2),
              ),
              child: const Center(
                child: Text('Keep package within frame', style: TextStyle(color: Colors.white70)),
              ),
            ),
          ),
          
          // Bottom Controls
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              padding: const EdgeInsets.all(24),
              color: Colors.black.withOpacity(0.7),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  IconButton(icon: const Icon(Icons.photo_library, color: Colors.white), onPressed: () {}),
                  FloatingActionButton(
                    backgroundColor: Colors.white,
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const ScannerScreen()));
                    },
                    child: const Icon(Icons.camera_alt, color: Colors.black, size: 32),
                  ),
                  IconButton(icon: const Icon(Icons.flash_off, color: Colors.white), onPressed: () {}),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
"""

files["lib/features/inspection/scanner_screen.dart"] = """
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
"""

for file_path, content in files.items():
    full_path = os.path.join(base, file_path.replace("/", "\\"))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
