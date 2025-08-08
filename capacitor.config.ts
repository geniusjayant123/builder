import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.attendance.tracker",
  appName: "AttendanceTracker",
  webDir: "dist/spa",
  server: {
    androidScheme: "https",
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: "APK"
    }
  }
};

export default config;
