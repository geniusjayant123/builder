#!/bin/bash

echo "🚀 Building AttendanceTracker Mobile App..."

# Build the mobile version
echo "📦 Building web assets..."
npm run build:mobile

# Copy assets to Android
echo "📱 Copying assets to Android..."
npx cap copy android

# Sync with Android
echo "🔄 Syncing with Android platform..."
npx cap sync android

echo "✅ Mobile app build complete!"
echo ""
echo "📱 Your Android project is ready in the 'android' folder"
echo ""
echo "Next steps:"
echo "1. Install Android Studio on your computer"
echo "2. Open the 'android' folder in Android Studio"
echo "3. Build APK: Build → Build Bundle(s) / APK(s) → Build APK(s)"
echo ""
echo "Or use online build services like Ionic AppFlow!"
