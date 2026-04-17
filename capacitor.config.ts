import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sreptrack.app',
  appName: 'S-reptrack',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    versionCode: 7,
    versionName: '1.0.6',
  },
};

export default config;
