#!/bin/bash

echo "🔧 Fixing macOS Firewall for Backend Access"
echo ""
echo "This script will help configure your Mac to allow incoming connections."
echo ""

# Check current firewall status
echo "📍 Current firewall status:"
/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

echo ""
echo "📋 To fix the connection issue, please do the following:"
echo ""
echo "1. Open System Settings > Network > Firewall"
echo "2. Click 'Options...'"
echo "3. Make sure 'Block all incoming connections' is UNCHECKED"
echo "4. Click '+' to add an application"
echo "5. Navigate to: /usr/bin/python3"
echo "6. Add it and make sure it's set to 'Allow incoming connections'"
echo "7. Also add Terminal.app if not already there"
echo "8. Click OK"
echo ""
echo "Alternative command-line method (requires admin password):"
echo "sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/bin/python3"
echo "sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/bin/python3"
echo ""
echo "After fixing firewall, the backend will be accessible at:"
echo "http://$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1):8000"