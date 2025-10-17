import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.junglekeeperapp',
  appName: 'jungle-keeper-app',
  webDir: 'dist',
  server: {
    url: 'https://6bcbc9d4-57cb-49d8-b821-4dcda0936c9c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
