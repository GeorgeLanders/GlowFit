import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.glowfit.app',
  appName: 'GlowFit',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    // The WebView paints this before React mounts, and again during overscroll.
    // Left unset it defaults to white, which flashes full-screen bright at the
    // start of every launch. Set to --bg-page-dark because a dark flash is far
    // less jarring than a white one; if light mode ever becomes the default,
    // change this to #F6F1FB to match.
    backgroundColor: '#1A102F',
  },
};

export default config;
