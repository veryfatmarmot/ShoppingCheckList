# Setup

Use this checklist when you clone the repo on a new PC and do not yet have the required local software or git-ignored local files.

The MVP runs in Expo Go (Android) and Expo Web. No JDK, Android SDK, or native build tooling is required for that — those only become necessary for the optional Android emulator, or later for the post-MVP dev-client build (see `specs/tickets.md` → P1-T1).

1. Install required software:

   - Git
   - Node.js LTS

   Optional (only if you want to run the app in an Android emulator instead of a physical device):

   - Android Studio with Android SDK, Platform-Tools, and Android Emulator
   - Note: the emulator needs hardware virtualization (Hyper-V/WHPX or the AEHD driver) to install correctly; on some machines this fails and a physical device is the simpler path.

2. On Windows, fix PowerShell `npm` blocking if needed:

   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```

   If you do not want to change this, use `npm.cmd` instead of `npm`.

3. Clone the repo and enter it:

   ```powershell
   git clone <repo-url>
   cd ShoppingCheckList
   ```

4. Install project dependencies:

   ```powershell
   npm.cmd install
   ```

   If npm asks about blocked install scripts, approve them by bare package name:

   ```powershell
   npm.cmd approve-scripts "@firebase/util"
   npm.cmd approve-scripts "esbuild"
   npm.cmd approve-scripts "protobufjs"
   ```

5. Create the local env file that Expo reads (Expo only loads `.env` from the app directory, not the repo root):

   ```powershell
   Copy-Item .env.example apps\mobile\.env
   ```

6. Fill `apps/mobile/.env` with the required values:

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

7. Make sure the Firebase project already exists and has:

   - a Web app registered
   - Google Authentication enabled
   - a Firestore database created
   - Google OAuth client IDs created for Web and Android

8. Log in to Firebase CLI (run in your own terminal — it opens a browser):

   ```powershell
   npx firebase-tools@latest login
   ```

9. Link the repo to the Firebase project:

   ```powershell
   npx firebase-tools@latest use --add
   ```

   Use the existing alias:

   - `shoppingchecklist`

10. Deploy Firestore config if needed:

    ```powershell
    npm.cmd run firebase:firestore
    ```

11. Run the web app:

    ```powershell
    npm.cmd run mobile:web
    ```

12. Run the Android app in Expo Go:

    - Install Expo Go on the phone and put it on the same Wi-Fi network as this PC.
    - Start the dev server and scan the QR code (or open the `exp://<pc-ip>:8081` URL) in Expo Go:

    ```powershell
    npm.cmd run mobile:android
    ```

    Important: the project is pinned to Expo SDK 54 because the Expo Go app from the Play Store supports exactly one SDK version (currently 54). Do not upgrade the `expo` package past SDK 54 until either Expo Go itself ships a newer SDK, or the project has moved to a dev-client build (P1-T1). If Expo Go reports "Project is incompatible with this version of Expo Go", the pin and the installed Expo Go version have drifted apart.

13. Verify the repo state:

    ```powershell
    cmd /c .\node_modules\.bin\tsc.cmd --noEmit -p packages\domain\tsconfig.json
    cmd /c .\node_modules\.bin\tsc.cmd --noEmit -p packages\data\tsconfig.json
    cmd /c .\node_modules\.bin\tsc.cmd --noEmit -p apps\mobile\tsconfig.json
    npm.cmd test
    npm.cmd run lint
    npm.cmd run format:check
    ```

14. Before continuing with the next ticket, read:

    - `specs/tickets.md`
    - `specs/spec-index.md`

15. After each completed ticket, check whether setup requirements changed. If they did, update this file.

---

## Deferred until P1-T1 (post-MVP dev-client build)

These steps are NOT needed while the app runs in Expo Go. They become relevant when the project moves to a custom dev-client build with native Google Sign-In:

- Install JDK 21, set `JAVA_HOME`, `ANDROID_HOME`, and add `%JAVA_HOME%\bin`, `%ANDROID_HOME%\platform-tools`, `%ANDROID_HOME%\emulator` to `Path`.
- Build and run the Android development build.
- Get this PC's debug SHA-1 from the debug keystore and register it in the Google Cloud / Firebase Android OAuth setup for package `dev.marmot.shoppingchecklist`:

  ```powershell
  & "$env:JAVA_HOME\bin\keytool.exe" -list -v -alias androiddebugkey -keystore "apps\mobile\android\app\debug.keystore" -storepass android -keypass android
  ```
