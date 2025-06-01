#!/bin/bash

echo "📱 AI Fitness Coach - Log Viewer"
echo "================================"
echo ""

# Find the Expo document directory on the device
# This path is different for iOS and Android
echo "Looking for log files..."
echo ""

# For development, logs are also output to console
echo "To view real-time logs:"
echo "1. Run: npx expo start"
echo "2. Press 'j' to open the JavaScript debugger"
echo ""

echo "The app now automatically saves all logs to a file."
echo "When the app runs, you'll see a message like:"
echo "📁 Logs are being saved to: [file path]"
echo ""

echo "To access the saved logs:"
echo "1. Add the Debug Log Screen to your navigation temporarily"
echo "2. Or check the console output for the log file path"
echo "3. The logs include:"
echo "   - App startup sequence"
echo "   - Auth check process"
echo "   - Navigation events"
echo "   - Any errors or warnings"
echo ""

echo "Common log messages to look for:"
echo "- '🚀 App index.ts loaded'"
echo "- 'App component rendering...'"
echo "- 'checkAuth called - starting auth check...'"
echo "- 'AsyncStorage read complete'"
echo "- 'Auth state updated successfully'"
echo "- 'App is ready'"
echo ""

echo "If the app is stuck on splash screen, these logs will show exactly where."