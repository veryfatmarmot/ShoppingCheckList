# Setup

Use this checklist when you clone the repo on a new PC and do not yet have the required local software or git-ignored local files.

Since M1-T1 the Android app runs as a custom Expo dev-client build (not Expo Go), because Google OAuth cannot complete inside Expo Go. Building it locally requires the Android SDK and a JDK. Expo Web needs neither.

1. Install required software:

   - Git
   - Node.js LTS
   - Android Studio with Android SDK and Platform-Tools (the bundled JetBrains JDK 21 at `C:\Program Files\Android\Android Studio\jbr` is used as `JAVA_HOME` — no separate JDK install needed)

   Optional:

   - Android Emulator (needs hardware virtualization; on some machines the driver fails to install and a physical device over USB is the simpler path)

2. On Windows, fix PowerShell `npm` blocking if needed:

   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```

   If you do not want to change this, use `npm.cmd` instead of `npm`.

3. Set environment variables (User scope):

   - `JAVA_HOME` = `C:\Program Files\Android\Android Studio\jbr`
   - `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`
   - add `%ANDROID_HOME%\platform-tools` to `Path`

4. Clone the repo and enter it:

   ```powershell
   git clone <repo-url>
   cd ShoppingCheckList
   ```

5. Install project dependencies:

   ```powershell
   npm.cmd install
   ```

   If npm asks about blocked install scripts, approve them by bare package name:

   ```powershell
   npm.cmd approve-scripts "@firebase/util"
   npm.cmd approve-scripts "esbuild"
   npm.cmd approve-scripts "protobufjs"
   ```

6. Create the local env file that Expo reads (Expo only loads `.env` from the app directory, not the repo root):

   ```powershell
   Copy-Item .env.example apps\mobile\.env
   ```

7. Fill `apps/mobile/.env` with the required values:

   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`
   - `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

8. Make sure the Firebase project already exists and has:

   - a Web app registered
   - Google Authentication enabled
   - a Firestore database created
   - Google OAuth client IDs created for Web and Android:
     - Web client: `http://localhost:8081` in Authorized JavaScript origins and redirect URIs (for Expo Web sign-in)
     - Android client: package `dev.marmot.shoppingchecklist` with the debug keystore SHA-1. Note: Expo's generated `android/app/debug.keystore` is the standard React Native debug keystore, identical on every machine (SHA-1 `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`), so this registration does not need updating when switching PCs.

9. Log in to Firebase CLI (run in your own terminal — it opens a browser):

   ```powershell
   npx firebase-tools@latest login
   ```

10. Link the repo to the Firebase project:

    ```powershell
    npx firebase-tools@latest use --add
    ```

    Use the existing alias:

    - `shoppingchecklist`

11. Deploy Firestore config if needed:

    ```powershell
    npm.cmd run firebase:firestore
    ```

12. Run the web app:

    ```powershell
    npm.cmd run mobile:web
    ```

13. Build and run the Android app on a physical device (first time on a new PC or after native config/dependency changes):

    - On the phone: enable Developer options (tap Build number 7 times), turn on USB debugging, connect via USB, accept the "Allow USB debugging" prompt.
    - The native `android/` directory is git-ignored and generated. Create or refresh it with:

      ```powershell
      cd apps\mobile
      npx expo prebuild --clean --platform android --no-install
      ```

    - Build, install, and launch (10–20 min the first time):

      ```powershell
      npm.cmd run mobile:android
      ```

    Day-to-day after the app is installed: just run `npm.cmd run mobile:start` and open the installed ShoppingCheckList app — it connects to Metro with hot reload like Expo Go did. Rebuild only when native dependencies or `app.json` native config change.

    Connecting the device to Metro: with the phone on USB, prefer an adb reverse tunnel over the LAN IP — the PC's Wi-Fi address changes with DHCP, but the tunnel does not:

    ```powershell
    adb reverse tcp:8081 tcp:8081
    ```

    Then in the dev-client launcher tap **Connect** on `http://localhost:8081`. (Re-run the command after replugging the device or restarting adb.)

    The `expo` package stays pinned to SDK 54; upgrading is possible with the dev client (it is not tied to Expo Go's supported SDK version) but must be a deliberate, separate change.

14. Verify the repo state:

    ```powershell
    cmd /c .\node_modules\.bin\tsc.cmd --noEmit -p packages\domain\tsconfig.json
    cmd /c .\node_modules\.bin\tsc.cmd --noEmit -p packages\data\tsconfig.json
    cmd /c .\node_modules\.bin\tsc.cmd --noEmit -p apps\mobile\tsconfig.json
    npm.cmd test
    npm.cmd run lint
    npm.cmd run format:check
    ```

15. Before continuing with the next ticket, read:

    - `specs/tickets.md`
    - `specs/spec-index.md`

16. After each completed ticket, check whether setup requirements changed. If they did, update this file.

---

## Deferred until P1-T1 (post-MVP native SDK migration)

Nothing extra to install today. P1-T1 swaps the mobile data layer to `@react-native-firebase/firestore` + `@react-native-firebase/auth` and native Google Sign-In; the dev-client build infrastructure it needs already exists (adopted at M1-T1). Expect it to add `google-services.json` handling and possibly release-keystore SHA-1 registration.
