# Firebase Setup

This project already includes:

- Firebase SDK installation in `packages/data`
- shared Firebase app/auth/firestore initialization
- Firestore CLI config in `firebase.json`
- prototype Firestore rules in `firestore.rules`
- empty Firestore index config in `firestore.indexes.json`
- example environment variables in `.env.example`
- Expo Auth Session wiring for Google sign-in
- Android Firebase config file at `apps/mobile/google-services.json`
- Expo development-build dependency for native Android auth testing
- automatic env sync from repo root `.env` to `apps/mobile/.env` before Expo commands

## What you need to do

### 1. Create or choose a Firebase project

Use the Firebase console:

- Create a new Firebase project, or
- Select an existing project for this app

Official docs:
- https://firebase.google.com/docs/web/setup

### 2. Register a Web app

In Project settings:

- Add app
- Choose Web
- Give it a nickname
- Copy the Firebase config values

These values go into the repo root `.env` file.

Required keys:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

Optional:

- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`

### 3. Create `.env`

Copy `.env.example` to `.env` and fill in your project values.

### 4. Enable Authentication

In Firebase console:

- Open Authentication
- Go to Sign-in method
- Enable Google

Official docs:
- https://firebase.google.com/docs/auth/web/google-signin

### 5. Create Google OAuth client IDs for Expo Auth Session

You also need Google OAuth client IDs for the Expo Auth Session flow.

Required for current targets:

- Web OAuth client ID -> `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- Android OAuth client ID -> `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

Optional for later iOS support:

- iOS OAuth client ID -> `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

These are created in Google Cloud / Firebase-linked project credentials, not in the Firebase web config block.

Note: `google-services.json` gives the Firebase Android app config and package name, but it does not replace these OAuth client IDs for Expo Auth Session.

Expo docs:
- https://docs.expo.dev/develop/authentication/

### 6. Enable Cloud Firestore

In Firebase console:

- Open Firestore Database
- Create database
- Use the default database
- Choose a region

Official docs:
- https://firebase.google.com/docs/firestore

### 7. Log in to Firebase CLI

Run:

```powershell
npx firebase-tools@latest login
```

### 8. Link the CLI to your Firebase project

Run:

```powershell
npx firebase-tools@latest use --add
```

Select your Firebase project.

### 9. Deploy Firestore rules and indexes

From the repo root:

```powershell
npm run firebase:firestore
```

Or separately:

```powershell
npm run firebase:rules
npm run firebase:indexes
```

### 10. Build Android natively once before collecting SHA-1

Expo Go is not enough for local Android OAuth testing.

From the repo root, use the development-build path:

```powershell
npm.cmd run mobile:android:dev
```

That generates and runs the native Android project locally. Make sure `ANDROID_HOME` points to your Android SDK before running it.

The repo will automatically sync the root `.env` into `apps/mobile/.env` before Expo commands run.

After that, read the debug keystore fingerprint:

```powershell
& "$env:JAVA_HOME\bin\keytool.exe" -list -v -alias androiddebugkey -keystore "D:\Projects\ShoppingCheckList\apps\mobile\android\app\debug.keystore" -storepass android -keypass android
```

Use that `SHA1:` value when creating the Android OAuth client for package `dev.marmot.shoppingchecklist`.

## Notes

- The current Firestore rules are a prototype and should be reviewed as the data layer evolves.
- Google sign-in wiring is implemented, but auth state/guarding lands in later tickets.
- Firestore offline persistence is a later ticket (`M5-T1`).
