import type { FirebaseOptions } from 'firebase/app';

const requiredConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
} as const;

function requireConfigValue(
  key: keyof typeof requiredConfig,
  value: string | undefined,
): string {
  if (!value) {
    throw new Error(`Missing Firebase config: ${key}`);
  }

  return value;
}

export function getFirebaseOptions(): FirebaseOptions {
  return {
    apiKey: requireConfigValue('apiKey', requiredConfig.apiKey),
    authDomain: requireConfigValue('authDomain', requiredConfig.authDomain),
    projectId: requireConfigValue('projectId', requiredConfig.projectId),
    storageBucket: requireConfigValue('storageBucket', requiredConfig.storageBucket),
    messagingSenderId: requireConfigValue(
      'messagingSenderId',
      requiredConfig.messagingSenderId,
    ),
    appId: requireConfigValue('appId', requiredConfig.appId),
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}
