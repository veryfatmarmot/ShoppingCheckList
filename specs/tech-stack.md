# Tech Stack

## Mandatory
- TypeScript
- React Native
- Expo
- Expo Web
- Expo Router
- Firebase Auth
- Cloud Firestore
- npm workspaces
- React Native StyleSheet
- ESLint
- Prettier
- Google login
- Expo Auth Session

## Package layout
- `apps/mobile`
- `packages/domain`
- `packages/data`
- `packages/ui`

## Layer boundaries
### `packages/domain`
- entities
- normalization
- validation
- pure helpers
- no React
- no Firebase

### `packages/data`
- Firebase init
- auth adapter
- Firestore repositories
- mappers
- no UI

### `apps/mobile`
- screens
- navigation
- hooks
- UI composition
- no direct Firestore calls from screens

### `packages/ui`
- shared presentational components only
- no business logic

## State
- local: React hooks
- global: minimal React Context only if needed
- forbidden: Redux, MobX, Zustand, XState, event bus

## Forms
- controlled components
- validation source of truth: domain layer
- forbidden for MVP: formik, react-hook-form

## Firebase scope
Use:
- Auth
- Firestore

## SDK choice (MVP)
- MVP uses the single `firebase` (web/modular) SDK for Firebase Auth + Firestore across Expo Web and the Android/iOS app.
- Known limitation: no disk-backed offline persistence on Android/iOS with this SDK — see `sync-rules.md` → "Known MVP Limitation — Mobile Offline Persistence".
- Planned post-MVP: `@react-native-firebase/auth` + `@react-native-firebase/firestore` for the mobile app only (native modules, requires a dev-client build); web keeps the JS SDK. Not part of the MVP dependency set — do not add these packages until that migration ticket is picked up.

## Auth implementation
- Google login uses Expo Auth Session + Firebase credential exchange

## Testing
- Vitest for domain-focused tests

Do not use for MVP:
- custom backend server
- Cloud Functions
- Realtime Database
- Storage
- Analytics
- Remote Config

## Data model assumptions
- strict per-user collections
- load full dataset for MVP
- client-side grouping/sorting
- full-document overwrite
- client timestamps
- client GUIDs
