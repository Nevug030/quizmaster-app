import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quizmaster.app',
  appName: 'Quizmaster',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#667eea",
      showSpinner: true,
      spinnerColor: "#ffffff"
    },
    StatusBar: {
      style: 'light'
    }
  }
};

export default config; 