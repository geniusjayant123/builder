#!/bin/bash

echo "🚀 Starting Ionic AppFlow build process..."

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Clean any existing builds
print_status "Cleaning existing builds..."
rm -rf android/ || true
rm -rf dist/ || true
rm -rf node_modules/.cache || true

# Step 2: Install dependencies
print_status "Installing dependencies..."
npm ci --prefer-offline --no-audit

# Step 3: Build web application
print_status "Building web application..."
npm run build:mobile

# Verify web build
if [ ! -d "dist/spa" ]; then
    print_error "Web build failed - dist/spa not found"
    exit 1
fi

print_status "Web build successful - found $(ls -1 dist/spa/ | wc -l) files"

# Step 4: Add Android platform (clean)
print_status "Adding Android platform..."
npx @capacitor/cli add android

# Verify Android platform was added
if [ ! -d "android" ]; then
    print_error "Android platform creation failed"
    exit 1
fi

# Step 5: Copy web assets
print_status "Copying web assets..."
npx @capacitor/cli copy android

# Step 6: Sync Capacitor
print_status "Syncing Capacitor..."
npx @capacitor/cli sync android

# Step 7: Verify Gradle wrapper
print_status "Verifying Gradle wrapper..."
if [ ! -f "android/gradlew" ]; then
    print_error "Gradle wrapper not found"
    exit 1
fi

# Make gradlew executable
chmod +x android/gradlew

# Verify gradle wrapper jar exists
if [ ! -f "android/gradle/wrapper/gradle-wrapper.jar" ]; then
    print_warning "Gradle wrapper jar missing - this may cause build issues"
fi

# Step 8: List Android project structure for debugging
print_status "Android project structure:"
ls -la android/
echo "Gradle files:"
ls -la android/gradle/wrapper/ || echo "Wrapper directory not found"

print_status "Build preparation complete!"
echo "🎯 Ready for Android APK build"
