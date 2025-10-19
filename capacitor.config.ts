import { CapacitorConfig } from '@capacitor/cli';

// Only enable live reload if CAP_SERVER_URL is explicitly provided
const isLiveReload = process.env.CAP_SERVER_URL;

const server = typeof isLiveReload === 'string' && isLiveReload.length > 0
  ? {
      url: isLiveReload,
      cleartext: true,
    }
  : {
      cleartext: true,
    };

const config: CapacitorConfig = {
  appId: 'app.lovable.junglekeeperapp',
  appName: 'S-reptrack',
  webDir: 'dist',
  server,
};

export default config;
