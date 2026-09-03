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