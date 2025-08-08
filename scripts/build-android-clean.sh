#!/bin/bash

echo "🧹 Cleaning and rebuilding Android project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Clean existing builds
print_status "Cleaning existing builds..."
rm -rf dist/
rm -rf android/
rm -rf node_modules/.cache

# Step 2: Install dependencies
print_status "Installing dependencies..."
npm ci

# Step 3: Build web app
print_status "Building web application..."
npm run build:mobile

if [ ! -d "dist/spa" ]; then
    print_error "Web build failed - dist/spa not created"
    exit 1
fi

print_status "Web build successful - found $(ls -1 dist/spa/ | wc -l) files"

# Step 4: Add Android platform
print_status "Adding Android platform..."
npx @capacitor/cli add android

if [ ! -d "android" ]; then
    print_error "Android platform creation failed"
    exit 1
fi

# Step 5: Copy assets
print_status "Copying web assets to Android..."
npx @capacitor/cli copy android

# Step 6: Sync Capacitor
print_status "Syncing Capacitor..."
npx @capacitor/cli sync android

# Step 7: Check Android setup
print_status "Verifying Android setup..."

if [ ! -f "android/gradlew" ]; then
    print_error "Gradle wrapper not found"
    exit 1
fi

if [ ! -d "android/app/src/main/assets/public" ]; then
    print_warning "Assets directory structure may be incorrect"
fi

# Step 8: Build APK (if local environment supports it)
if command -v gradlew >/dev/null 2>&1; then
    print_status "Building APK locally..."
    cd android
    chmod +x gradlew
    ./gradlew clean assembleDebug
    
    if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
        print_status "APK built successfully!"
        ls -lh app/build/outputs/apk/debug/app-debug.apk
    else
        print_error "APK build failed"
    fi
else
    print_warning "Local Android SDK not found - use GitHub Actions or Android Studio"
fi

print_status "Android project ready for building!"
echo "📁 Project structure:"
echo "   ├── dist/spa/ (web build)"
echo "   ├── android/ (Android project)"
echo "   └── capacitor.config.ts"
echo ""
echo "🚀 Next steps:"
echo "   • Use GitHub Actions workflow"
echo "   • Or open 'android' folder in Android Studio"
