import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // NOTE: this must stay in sync with `applicationId` + `namespace` in
  // android/app/build.gradle and `package_name` in res/values/strings.xml.
  // It was originally com.glowfit.app, which is permanently owned by another
  // developer on Google Play ("GlowFit: Makeup & Style AI", Málaga, ES), so
  // Play Console rejected the upload with "package name is already in use".
  // Play package names are global and can never be reclaimed.
  appId: 'com.georgelanders.glowfit',
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
