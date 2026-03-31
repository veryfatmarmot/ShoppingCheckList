# Firebase Setup

This project already includes:

- Firebase SDK installation in `packages/data`
- shared Firebase app/auth/firestore initialization
- Firestore CLI config in `firebase.json`
- prototype Firestore rules in `firestore.rules`
- empty Firestore index config in `firestore.indexes.json`
- example environment variables in `.env.example`

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

These values go into a local `.env` file at the repo root.

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

### 5. Enable Cloud Firestore

In Firebase console:

- Open Firestore Database
- Create database
- Use the default database
- Choose a region

Official docs:
- https://firebase.google.com/docs/firestore

### 6. Log in to Firebase CLI

Run:

```powershell
npx firebase-tools@latest login
```

### 7. Link the CLI to your Firebase project

Run:

```powershell
npx firebase-tools@latest use --add
```

Select your Firebase project.

### 8. Deploy Firestore rules and indexes

From the repo root:

```powershell
npm run firebase:firestore
```

Or separately:

```powershell
npm run firebase:rules
npm run firebase:indexes
```

## Notes

- The current Firestore rules are a prototype and should be reviewed as the data layer evolves.
- Google sign-in inside the app is implemented in a later ticket (`M1-T1`).
- Firestore offline persistence is a later ticket (`M5-T1`).
