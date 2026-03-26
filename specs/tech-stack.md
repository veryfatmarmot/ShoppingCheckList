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
