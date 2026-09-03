import os

base = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\apps\mobile"
files = {}

files["pubspec.yaml"] = """
name: metroniq_mobile
description: MetronIQ Legal Metrology Field Inspection App.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
"""

files["lib/main.dart"] = """
import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'features/home/home_screen.dart';

void main() {
  runApp(const MetronIQApp());
}

class MetronIQApp extends StatelessWidget {
  const MetronIQApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MetronIQ',
      theme: AppTheme.lightTheme,
      home: const MainNavigation(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    PlaceholderScreen(title: 'Inspect'),
    PlaceholderScreen(title: 'Priority'),
    PlaceholderScreen(title: 'History'),
    PlaceholderScreen(title: 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.camera_alt_outlined), selectedIcon: Icon(Icons.camera_alt), label: 'Inspect'),
          NavigationDestination(icon: Icon(Icons.warning_amber_rounded), selectedIcon: Icon(Icons.warning), label: 'Priority'),
          NavigationDestination(icon: Icon(Icons.history), selectedIcon: Icon(Icons.history), label: 'History'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class PlaceholderScreen extends StatelessWidget {
  final String title;
  const PlaceholderScreen({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(child: Text('Placeholder for $title\\nStage 4 Mobile Component', textAlign: TextAlign.center)),
    );
  }
}
"""

files["lib/core/theme/app_colors.dart"] = """
import 'package:flutter/material.dart';

class AppColors {
  // Brand
  static const Color deepNavy = Color(0xFF0A192F);
  static const Color blueAccent = Color(0xFF1E3A8A);
  
  // Surfaces
  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Colors.white;
  static const Color border = Color(0xFFE2E8F0);
  
  // Text
  static const Color textMain = Color(0xFF334155);
  static const Color textMuted = Color(0xFF64748B);
  static const Color textLight = Colors.white;
  
  // Semantic / Status
  static const Color passGreen = Color(0xFF10B981);
  static const Color passGreenLight = Color(0xFFD1FAE5);
  static const Color reviewAmber = Color(0xFFF59E0B);
  static const Color reviewAmberLight = Color(0xFFFEF3C7);
  static const Color failRed = Color(0xFFEF4444);
  static const Color failRedLight = Color(0xFFFEE2E2);
}
"""

files["lib/core/theme/app_theme.dart"] = """
import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.deepNavy,
        primary: AppColors.deepNavy,
        secondary: AppColors.blueAccent,
        background: AppColors.background,
        surface: AppColors.surface,
      ),
      scaffoldBackgroundColor: AppColors.background,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.deepNavy,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: CardTheme(
        elevation: 1,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        color: AppColors.surface,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.blueAccent,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white,
        indicatorColor: AppColors.blueAccent.withOpacity(0.2),
        labelTextStyle: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return const TextStyle(color: AppColors.deepNavy, fontWeight: FontWeight.bold, fontSize: 12);
          }
          return const TextStyle(color: AppColors.textMuted, fontSize: 12);
        }),
      ),
    );
  }
}
"""

files["lib/core/constants/demo_data.dart"] = """
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
"""

for file_path, content in files.items():
    full_path = os.path.join(base, file_path.replace("/", "\\"))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
