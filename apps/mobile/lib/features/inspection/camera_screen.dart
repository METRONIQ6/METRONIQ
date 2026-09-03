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