import { CapacitorConfig } from '@capacitor/cli';

const isLiveReload = process.env.CAP_SERVER_URL || process.env.NODE_ENV === 'development';

const server = typeof isLiveReload === 'string' || isLiveReload
  ? {
      url: (typeof isLiveReload === 'string' ? isLiveReload : 'https://6bcbc9d4-57cb-49d8-b821-4dcda0936c9c.lovableproject.com?forceHideBadge=true'),
      cleartext: true,
    }
  : {
      cleartext: true,
    };

const config: CapacitorConfig = {
  appId: 'app.lovable.junglekeeperapp',
  appName: 'jungle-keeper-app',
  webDir: 'dist',
  server,
};

export default config;
