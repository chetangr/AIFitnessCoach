# Android USB Setup (No WiFi Needed!)

This method uses USB connection, bypassing all network issues.

## Steps:

1. **Enable Developer Mode on Android:**
   - Settings → About Phone → Tap "Build Number" 7 times
   - Go back to Settings → Developer Options → Enable "USB Debugging"

2. **Connect Phone via USB**

3. **Install ADB (Android Debug Bridge):**
   ```bash
   brew install android-platform-tools
   ```

4. **Set up Port Forwarding:**
   ```bash
   # Check device is connected
   adb devices
   
   # Forward port 8000
   adb reverse tcp:8000 tcp:8000
   ```

5. **Update your .env file:**
   ```
   EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
   EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

6. **Run the app:**
   ```bash
   npx expo start
   # Press 'a' for Android
   ```

Now the app will use localhost:8000 which is forwarded through USB!

## Benefits:
- ✅ No WiFi configuration needed
- ✅ No firewall issues
- ✅ Faster than WiFi
- ✅ Works everywhere

## To Remove Forwarding:
```bash
adb reverse --remove tcp:8000
```