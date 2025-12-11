import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sreptrack.app',
  appName: 'S-reptrack',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
};

export default config;
