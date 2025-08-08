import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.attendance.tracker',
  appName: 'AttendanceTracker',
  webDir: 'dist/spa',
  server: {
    androidScheme: 'https'
  }
};

export default config;
