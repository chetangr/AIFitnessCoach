#!/bin/bash

# Backend startup script
cd /Users/chetangrandhe/Desktop/AIFitnessCoach/AIFitnessCoachApp/backend

echo "🚀 Starting AI Fitness Coach Backend..."
echo ""

# Check Python version
echo "Python version:"
python3 --version
echo ""

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Install missing dependencies
echo "Installing/updating dependencies..."
pip install greenlet aiosqlite

# Start the backend
echo ""
echo "Starting backend on http://localhost:8000"
echo "Backend will be accessible through your Cloudflare tunnel"
echo ""

python3 app.py