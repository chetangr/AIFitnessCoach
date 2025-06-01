#!/bin/bash

echo "🔧 AI Fitness Coach App Troubleshooting"
echo "======================================="

# Kill any existing Metro processes
echo "1. Killing existing Metro processes..."
pkill -f "metro" || true
pkill -f "react-native" || true

# Clear all caches
echo "2. Clearing all caches..."
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
rm -rf $TMPDIR/react-*

# Clear watchman
echo "3. Clearing watchman..."
watchman watch-del-all 2>/dev/null || true

# Clear Expo cache
echo "4. Clearing Expo cache..."
rm -rf ~/.expo

echo "5. Ready to start fresh!"
echo ""
echo "Now run:"
echo "  npx expo start -c"
echo ""
echo "If still stuck on splash screen, check the console for:"
echo "  - 'AI Fitness Coach App Started'"
echo "  - 'Starting app initialization...'"
echo "  - 'Auth check completed'"
echo "  - 'App is ready'"
echo ""
echo "The app should show 'Loading...' text with a spinner."