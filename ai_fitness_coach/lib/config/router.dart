import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../presentation/screens/splash/splash_screen.dart';
import '../presentation/screens/auth/login_screen.dart';
import '../presentation/screens/onboarding/onboarding_screen.dart';
import '../presentation/screens/onboarding/coach_selection_screen.dart';
import '../presentation/screens/main/main_screen.dart';
import '../presentation/screens/workouts/active_workout_screen.dart';
import '../presentation/screens/performance/performance_screen.dart';
import '../presentation/screens/settings/settings_screen.dart';
import '../models/workout.dart';

part 'router.g.dart';

@riverpod
GoRouter router(RouterRef ref) {
  return GoRouter(
    initialLocation: '/splash',
    debugLogDiagnostics: true,
    routes: [
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/coach-selection',
        name: 'coach-selection',
        builder: (context, state) => const CoachSelectionScreen(),
      ),
      GoRoute(
        path: '/main',
        name: 'main',
        builder: (context, state) => const MainScreen(),
      ),
      GoRoute(
        path: '/active-workout',
        name: 'active-workout',
        builder: (context, state) {
          final workoutPlan = state.extra as WorkoutPlan?;
          if (workoutPlan == null) {
            return const MainScreen(); // Fallback
          }
          return ActiveWorkoutScreen(workoutPlan: workoutPlan);
        },
      ),
      GoRoute(
        path: '/performance',
        name: 'performance',
        builder: (context, state) => const PerformanceScreen(),
      ),
      GoRoute(
        path: '/settings',
        name: 'settings',
        builder: (context, state) => const SettingsScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Error: ${state.error}'),
      ),
    ),
  );
}