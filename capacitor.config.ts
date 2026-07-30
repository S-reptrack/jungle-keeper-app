import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sreptrack.app',
  appName: 'S-reptrack',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    versionCode: 8,
    versionName: '1.0.8',
  },
};

export default config;

