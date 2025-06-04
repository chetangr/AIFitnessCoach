# Network Troubleshooting Guide

## Issue: Cannot access backend from phone on same WiFi

### Step 1: Check macOS Firewall Settings

1. **Open System Settings** → **Network** → **Firewall**
2. Make sure firewall is either:
   - Turned OFF (temporarily for testing)
   - OR has "Block all incoming connections" UNCHECKED
3. If firewall is on, click "Options" and add Python/Terminal to allowed apps

### Step 2: Allow Incoming Connections

When you run the backend, macOS might show a popup:
- "Do you want the application 'Python' to accept incoming network connections?"
- **Click "Allow"**

### Step 3: Test with Simple Python Server

Run this in Terminal:
```bash
cd /Users/chetangrandhe/Desktop/AIFitnessCoach/AIFitnessCoachApp/backend
python3 -m http.server 8000
```

Then try accessing from your phone:
- http://192.168.1.187:8000

If this works, the issue is with the FastAPI app. If not, it's a network/firewall issue.

### Step 4: Alternative Solutions

#### Option A: Use ngrok (Recommended for Testing)
```bash
# Install ngrok
brew install ngrok

# Start your backend
cd backend && python app.py

# In another terminal, expose it
ngrok http 8000
```

This will give you a public URL like `https://abc123.ngrok.io` that works from anywhere.

#### Option B: Use localhost tunneling with Expo
```bash
# In your app, use localhost
# Expo will handle the tunneling
```

Update `src/config/api.ts`:
```typescript
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000'  // Expo will tunnel this
  : 'https://api.aifitnesscoach.com';
```

Then in `app.json`, add:
```json
{
  "expo": {
    "packagerOpts": {
      "hostType": "tunnel"
    }
  }
}
```

### Step 5: Verify Network Configuration

1. **Check both devices are on same network**:
   ```bash
   # On Mac
   ifconfig | grep "inet "
   
   # Should show something like:
   # inet 192.168.1.187
   ```

2. **On your phone**:
   - Go to WiFi settings
   - Check IP address (should be 192.168.1.xxx)

3. **Test ping from phone** (if you have a terminal app):
   ```bash
   ping 192.168.1.187
   ```

### Step 6: Start Backend with Specific Instructions

```bash
# Terminal 1
cd /Users/chetangrandhe/Desktop/AIFitnessCoach/AIFitnessCoachApp/backend
source venv/bin/activate
pip install greenlet

# Start with explicit host binding
python -c "import uvicorn; from app import app; uvicorn.run(app, host='0.0.0.0', port=8000)"
```

### Step 7: If Nothing Works - Use Demo Mode

The app has a demo mode that doesn't require backend:
1. Just use the app without the backend running
2. Most features will work with mock data
3. AI Coach will show demo responses

### Common Issues and Solutions

1. **"Connection Refused"** - Backend not running or firewall blocking
2. **"Network Error"** - Wrong IP address or not on same network  
3. **"Timeout"** - Firewall silently dropping packets
4. **Port already in use** - Kill existing process: `lsof -ti:8000 | xargs kill -9`

### Recommended Approach for Development

Use **ngrok** for hassle-free development:
```bash
# Install once
brew install ngrok

# Sign up for free account at ngrok.com
ngrok config add-authtoken YOUR_TOKEN

# Use it
ngrok http 8000
```

Then update your API URL to the ngrok URL. This bypasses all local network issues.