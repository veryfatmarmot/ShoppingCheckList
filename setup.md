# Setup

Use this checklist when you clone the repo on a new PC and do not yet have the required local software or git-ignored local files.

1. Install required software:
   - Git
   - Node.js LTS
   - JDK 21
   - Android Studio with:
     - Android SDK
     - Android SDK Platform-Tools
     - Android Emulator

2. On Windows, fix PowerShell `npm` blocking if needed:

   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```

   If you do not want to change this, use `npm.cmd` instead of `npm`.

3. Set environment variables:
   - `JAVA_HOME` = your JDK 21 folder
   - `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`

4. Add to `Path`:
   - `%JAVA_HOME%\bin`
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`

5. Verify the local tools:

   ```powershell
   java -version
   adb --version
   emulator -version
   ```

6. Clone the repo and enter it:

   ```powershell
   git clone <repo-url>
   cd ShoppingCheckList
   ```

7. Install project dependencies:

   ```powershell
   npm.cmd install
   ```

   This also applies the React Native Gradle plugin compatibility patch needed for Android development builds on Gradle 9.

8. Create the local env file at the repo root:

   ```powershell
   Copy-Item .env.example .env
   ```

9. Fill `.env` with the required values:
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

10. Make sure the Firebase project already exists and has:
    - a Web app registered
    - Google Authentication enabled
    - a Firestore database created
    - Google OAuth client IDs created for Web and Android

11. Log in to Firebase CLI:

    ```powershell
    npx firebase-tools@latest login
    ```

12. Link the repo to the Firebase project:

    ```powershell
    npx firebase-tools@latest use --add
    ```

    Use the existing alias:
    - `shoppingchecklist`

13. Deploy Firestore config if needed:

    ```powershell
    npm.cmd run firebase:firestore
    ```

14. Start an Android emulator from Android Studio.

15. Run the web app:

    ```powershell
    npm.cmd run mobile:web
    ```

16. Run the Android app in Expo Go if you only need general app testing:

    ```powershell
    npm.cmd run mobile:android
    ```

17. Run the Android development build if you need native Google auth / SHA-1 setup:

    ```powershell
    npm.cmd run mobile:android:dev
    ```

    The repo automatically syncs the root `.env` into `apps/mobile/.env` before Expo commands run.

18. After the development build runs once, get this PC's debug SHA-1:

    ```powershell
    & "$env:JAVA_HOME\bin\keytool.exe" -list -v -alias androiddebugkey -keystore "D:\Projects\ShoppingCheckList\apps\mobile\android\app\debug.keystore" -storepass android -keypass android
    ```

19. If the SHA-1 is different from the old PC, update the Google Cloud / Firebase Android OAuth setup for package:
    - `dev.marmot.shoppingchecklist`

20. Verify the repo state:

    ```powershell
    cmd /c .\node_modules\.bin\tsc.cmd --noEmit -p packages\domain\tsconfig.json
    cmd /c .\node_modules\.bin\tsc.cmd --noEmit -p packages\data\tsconfig.json
    cmd /c .\node_modules\.bin\tsc.cmd --noEmit -p apps\mobile\tsconfig.json
    npm.cmd test
    ```

21. Before continuing with the next ticket, read:
    - `specs/tickets.md`
    - `specs/spec-index.md`

22. After each completed ticket, check whether setup requirements changed. If they did, update this file.
