import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:ui';
import '../../../core/theme/app_theme.dart';
import '../../../providers/user_preferences_provider.dart';
import '../../../providers/theme_provider.dart';
import '../../widgets/glass_widgets.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  @override
  Widget build(BuildContext context) {
    final userData = ref.watch(userPreferencesProvider);
    final settings = ref.watch(themeProvider);
    final themeNotifier = ref.read(themeProvider.notifier);
    
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Custom app bar with glassmorphism
              ClipRRect(
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.white.withOpacity(0.1),
                          Colors.white.withOpacity(0.05),
                        ],
                      ),
                      border: Border(
                        bottom: BorderSide(
                          color: Colors.white.withOpacity(0.1),
                          width: 0.5,
                        ),
                      ),
                    ),
                    child: Row(
                      children: [
                        GestureDetector(
                          onTap: () {
                            HapticFeedback.lightImpact();
                            Navigator.pop(context);
                          },
                          child: Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white.withOpacity(0.1),
                              border: Border.all(
                                color: Colors.white.withOpacity(0.2),
                              ),
                            ),
                            child: const Icon(
                              Icons.arrow_back,
                              color: Colors.white,
                              size: 20,
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        const Text(
                          'Settings',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              // Settings content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Account Section
            _buildSectionTitle('Account'),
            _buildSettingCard(
              children: [
                _buildAccountItem(
                  icon: Icons.person_outline,
                  title: 'Profile',
                  subtitle: userData.name ?? 'Set up your profile',
                  onTap: () {
                    // Navigate to profile edit
                  },
                ),
                _buildDivider(),
                _buildAccountItem(
                  icon: Icons.email_outlined,
                  title: 'Email',
                  subtitle: 'user@example.com',
                  onTap: () {
                    // Navigate to email change
                  },
                ),
                _buildDivider(),
                _buildAccountItem(
                  icon: Icons.lock_outline,
                  title: 'Password',
                  subtitle: 'Change your password',
                  onTap: () {
                    // Navigate to password change
                  },
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            
            // Notifications Section
            _buildSectionTitle('Notifications'),
            _buildSettingCard(
              children: [
                _buildToggleItem(
                  icon: Icons.notifications_outlined,
                  title: 'Push Notifications',
                  subtitle: 'Get reminders for your workouts',
                  value: settings.notificationsEnabled,
                  onChanged: (value) {
                    themeNotifier.toggleNotifications();
                    HapticFeedback.lightImpact();
                  },
                ),
                _buildDivider(),
                _buildToggleItem(
                  icon: Icons.volume_up_outlined,
                  title: 'Sound Effects',
                  subtitle: 'Play sounds during workouts',
                  value: settings.soundEffectsEnabled,
                  onChanged: (value) {
                    themeNotifier.toggleSoundEffects();
                    HapticFeedback.lightImpact();
                  },
                ),
                _buildDivider(),
                _buildToggleItem(
                  icon: Icons.record_voice_over_outlined,
                  title: 'Voice Coaching',
                  subtitle: 'AI coach speaks instructions and encouragement',
                  value: settings.voiceCoachingEnabled,
                  onChanged: (value) {
                    themeNotifier.toggleVoiceCoaching();
                    HapticFeedback.lightImpact();
                  },
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            
            // Preferences Section
            _buildSectionTitle('Preferences'),
            _buildSettingCard(
              children: [
                _buildToggleItem(
                  icon: Icons.dark_mode_outlined,
                  title: 'Dark Mode',
                  subtitle: 'Use dark theme',
                  value: settings.darkMode,
                  onChanged: (value) {
                    themeNotifier.toggleDarkMode();
                    HapticFeedback.lightImpact();
                  },
                ),
                _buildDivider(),
                _buildSelectItem(
                  icon: Icons.straighten_outlined,
                  title: 'Units',
                  subtitle: settings.units,
                  onTap: () {
                    _showUnitSelector(settings.units, themeNotifier);
                  },
                ),
                _buildDivider(),
                _buildSelectItem(
                  icon: Icons.language_outlined,
                  title: 'Language',
                  subtitle: 'English',
                  onTap: () {
                    // Show language selector
                  },
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            
            // About Section
            _buildSectionTitle('About'),
            _buildSettingCard(
              children: [
                _buildInfoItem(
                  icon: Icons.info_outline,
                  title: 'Version',
                  value: '1.0.0',
                ),
                _buildDivider(),
                _buildAccountItem(
                  icon: Icons.privacy_tip_outlined,
                  title: 'Privacy Policy',
                  subtitle: 'View our privacy policy',
                  onTap: () {
                    // Open privacy policy
                  },
                ),
                _buildDivider(),
                _buildAccountItem(
                  icon: Icons.description_outlined,
                  title: 'Terms of Service',
                  subtitle: 'View terms of service',
                  onTap: () {
                    // Open terms
                  },
                ),
                _buildDivider(),
                _buildAccountItem(
                  icon: Icons.refresh_outlined,
                  title: 'Reset Settings',
                  subtitle: 'Reset all preferences to defaults',
                  onTap: () {
                    themeNotifier.resetToDefaults();
                    HapticFeedback.lightImpact();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Settings reset to defaults')),
                    );
                  },
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            
            // Danger Zone
            _buildSectionTitle('Account Actions'),
            _buildSettingCard(
              children: [
                _buildAccountItem(
                  icon: Icons.logout,
                  title: 'Sign Out',
                  subtitle: 'Sign out of your account',
                  onTap: () {
                    _showSignOutDialog();
                  },
                  isDanger: true,
                ),
                _buildDivider(),
                _buildAccountItem(
                  icon: Icons.delete_forever,
                  title: 'Delete Account',
                  subtitle: 'Permanently delete your account',
                  onTap: () {
                    _showDeleteAccountDialog();
                  },
                  isDanger: true,
                ),
              ],
            ),
            
            const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 12),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: Colors.white.withOpacity(0.6),
          letterSpacing: 0.5,
        ),
      ),
    );
  }
  
  Widget _buildSettingCard({required List<Widget> children}) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.white.withOpacity(0.1),
                Colors.white.withOpacity(0.05),
              ],
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.white.withOpacity(0.2),
              width: 1.5,
            ),
          ),
          child: Column(children: children),
        ),
      ),
    );
  }
  
  Widget _buildAccountItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isDanger = false,
  }) {
    return InkWell(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isDanger 
                    ? Colors.red.withOpacity(0.1)
                    : Colors.white.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: isDanger ? Colors.red : Colors.white,
                size: 20,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: isDanger ? Colors.red : Colors.white,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white.withOpacity(0.6),
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: Colors.white.withOpacity(0.4),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildToggleItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: const Color(0xFF007AFF),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSelectItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 14,
                color: Colors.white.withOpacity(0.6),
              ),
            ),
            const SizedBox(width: 8),
            Icon(
              Icons.chevron_right,
              color: Colors.white.withOpacity(0.4),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildInfoItem({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withOpacity(0.6),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildDivider() {
    return Divider(
      height: 1,
      color: Colors.white.withOpacity(0.1),
      indent: 72,
    );
  }
  
  void _showUnitSelector(String currentUnit, ThemeNotifier themeNotifier) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withOpacity(0.1),
                  Colors.white.withOpacity(0.05),
                ],
              ),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              border: Border.all(
                color: Colors.white.withOpacity(0.2),
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Select Units',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 20),
                ListTile(
                  title: const Text('Metric (kg, km)', style: TextStyle(color: Colors.white)),
                  leading: Radio<String>(
                    value: 'Metric',
                    groupValue: currentUnit,
                    onChanged: (value) {
                      themeNotifier.setUnits(value!);
                      Navigator.pop(context);
                    },
                  ),
                ),
                ListTile(
                  title: const Text('Imperial (lb, mi)', style: TextStyle(color: Colors.white)),
                  leading: Radio<String>(
                    value: 'Imperial',
                    groupValue: currentUnit,
                    onChanged: (value) {
                      themeNotifier.setUnits(value!);
                      Navigator.pop(context);
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
  
  void _showSignOutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text(
          'Sign Out',
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          'Are you sure you want to sign out?',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              // Implement sign out
              Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
            },
            child: const Text(
              'Sign Out',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
  
  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text(
          'Delete Account',
          style: TextStyle(color: Colors.red),
        ),
        content: const Text(
          'This action cannot be undone. All your data will be permanently deleted.',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              // Implement account deletion
              Navigator.pop(context);
            },
            child: const Text(
              'Delete',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}