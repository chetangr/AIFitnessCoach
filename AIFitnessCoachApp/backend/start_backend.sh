#!/bin/bash

# Start the AI Fitness Coach Backend

echo "🏃 Starting AI Fitness Coach Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating one..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
echo "📦 Installing dependencies..."
pip install greenlet
pip install -r requirements.txt

# Get the machine's IP address
IP_ADDRESS=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "💻 Your machine's IP address: $IP_ADDRESS"
echo "📱 Use this address in your mobile app: http://$IP_ADDRESS:8000"

# Start the backend
echo "🚀 Starting server on http://0.0.0.0:8000"
echo "✅ Backend will be accessible at:"
echo "   - http://localhost:8000 (on this machine)"
echo "   - http://$IP_ADDRESS:8000 (from other devices)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python app.py