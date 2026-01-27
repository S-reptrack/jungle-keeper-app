import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sreptrack.app',
  appName: 'S-reptrack',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    versionCode: 3,
    versionName: '1.0.2',
  },
};

export default config;
