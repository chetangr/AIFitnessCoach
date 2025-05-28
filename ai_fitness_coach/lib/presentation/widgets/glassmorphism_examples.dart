import 'package:flutter/material.dart';
import 'glass_widgets.dart';

// Example usage of glassmorphic components
class GlassmorphismExamples extends StatelessWidget {
  const GlassmorphismExamples({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF1A1A1A),
              Color(0xFF0A0A0A),
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Glassmorphism Components',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 32),
                
                // Basic Glass Card
                const Text(
                  'Glass Cards',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                GlassMorphicCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Basic Glass Card',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'This is a basic glass card with blur effect and subtle animations.',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 16),
                
                // Colored Glass Card
                GlassMorphicCard(
                  color: const Color(0xFF007AFF),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Colored Glass Card',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Glass card with custom color tint.',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white.withOpacity(0.9),
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 32),
                
                // Glass Buttons
                const Text(
                  'Glass Buttons',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: GlassMorphicButton(
                        text: 'Secondary',
                        onPressed: () {},
                        icon: Icons.star,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: GlassMorphicButton(
                        text: 'Primary',
                        onPressed: () {},
                        isPrimary: true,
                        icon: Icons.arrow_forward,
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 32),
                
                // Glass Text Fields
                const Text(
                  'Glass Text Fields',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                GlassMorphicTextField(
                  label: 'Email Address',
                  prefixIcon: Icons.email,
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 16),
                GlassMorphicTextField(
                  label: 'Password',
                  prefixIcon: Icons.lock,
                  obscureText: true,
                ),
                const SizedBox(height: 16),
                GlassMorphicTextField(
                  label: 'Error Example',
                  prefixIcon: Icons.warning,
                  errorText: 'This field has an error',
                ),
                
                const SizedBox(height: 32),
                
                // Interactive Card
                const Text(
                  'Interactive Glass Card',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                GlassMorphicCard(
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Card tapped!'),
                        backgroundColor: Color(0xFF007AFF),
                      ),
                    );
                  },
                  borderRadius: BorderRadius.circular(20),
                  child: Row(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const LinearGradient(
                            colors: [Color(0xFF007AFF), Color(0xFF00C7BE)],
                          ),
                        ),
                        child: const Icon(
                          Icons.touch_app,
                          color: Colors.white,
                          size: 28,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Tap Me!',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              'Interactive card with tap handler',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.white.withOpacity(0.7),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        Icons.arrow_forward_ios,
                        color: Colors.white.withOpacity(0.5),
                        size: 16,
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 100),
              ],
            ),
          ),
        ),
      ),
      // Example Navigation Bar
      bottomNavigationBar: GlassMorphicNavBar(
        currentIndex: 0,
        onTap: (index) {},
        items: const [
          GlassNavItem(icon: Icons.home, label: 'Home'),
          GlassNavItem(icon: Icons.search, label: 'Search'),
          GlassNavItem(icon: Icons.add_box, label: 'Create'),
          GlassNavItem(icon: Icons.favorite, label: 'Likes'),
          GlassNavItem(icon: Icons.person, label: 'Profile'),
        ],
      ),
    );
  }
}