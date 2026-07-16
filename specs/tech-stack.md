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
- Planned post-MVP: `@react-native-firebase/auth` + `@react-native-firebase/firestore` for the mobile app only (native modules); web keeps the JS SDK. Not part of the MVP dependency set — do not add these packages until that migration ticket is picked up.

## App runtime (MVP)
- The Android app runs as a custom Expo dev-client build (`expo-dev-client`, built locally with `expo run:android`), not Expo Go.
- Reason: Google OAuth cannot complete inside Expo Go — Expo removed the auth proxy, and Google rejects Expo Go's `exp://` redirect scheme. A dev-client build has the app's own package name and scheme, which Google accepts.
- Decision history: the original plan was Expo Go until post-MVP; moving off Expo Go was pulled forward to M1-T1 out of the P1-T1 ticket. The rest of P1-T1 (native Firebase SDKs) remains post-MVP.
- Day-to-day development is unchanged: same Metro dev server, hot reload, and `firebase` JS SDK.

## Auth implementation
- Google login uses Expo Auth Session + Firebase credential exchange
- On Android this requires the dev-client build (see "App runtime"); on web it works directly
- Mobile auth persistence (M1-T2): `initializeAuth` with `@react-native-async-storage/async-storage` — the JS SDK has no disk persistence for auth on React Native by default. This dependency is approved for the MVP. Web persists via IndexedDB automatically.

## Theming
- The app is dark-only. There is no light mode and no runtime theme switching.
- All colors live in `apps/mobile/theme.ts` as semantic tokens; no screen or
  component may hardcode a color. See `ux-flows.md` → Global UX Rules → Visual
  Theme for the palette rules (mint = accent, coral = destructive only).
- `expo-system-ui` is approved for the MVP (added M6-T6). It is what makes
  `app.json`'s `userInterfaceStyle` take effect and what paints the native root
  view (`AppTheme`'s `android:windowBackground`).
- **`app.json` must keep BOTH `userInterfaceStyle: "dark"` AND
  `backgroundColor: "#2b2b2b"`.** The plugin resolves the root-view color as
  `android.backgroundColor || backgroundColor || null` — with neither key set it
  returns null and does nothing, so the package installs, the prebuild warning
  disappears, and the app still flashes white before the first JS paint. Both
  failures are silent; verify by checking that `values/colors.xml` contains
  `activityBackground` and that `AppTheme` sets `android:windowBackground`.
- No icon library is used — catalog/group rows are text-only by design. Adding
  per-category icons would need a new dependency plus a `Group.icon` field; see
  `tickets.md` → M6-T6.

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
