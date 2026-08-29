# Implementation Plan - Open SpeakMind on Connected Device

This plan outlines the steps to build, deploy, and run the SpeakMind project on the connected Motorola device (`ZA222L7FQV`). Since the project consists of a Next.js web application and an Android WebView wrapper, we need to orchestrate both environments.

## User Review Required

> [!IMPORTANT]
> This process will start a background Next.js development server on your machine and use `adb reverse` to forward port 3000 to the connected device. Ensure the device remains connected via USB during this process.

## Proposed Changes

### Android Component

#### [MODIFY] [MainActivity.java](file:///D:/SpeakMind/android/app/src/main/java/com/speakmind/MainActivity.java)
- Change `APP_URL` from `http://10.0.2.2:3000` to `http://localhost:3000`. This allows using `adb reverse` to connect to the dev server running on the host machine, which is more reliable for physical devices than trying to guess the host's local IP.

#### [NEW] Gradle Wrapper
- Generate the Gradle wrapper in the `android/` directory using a system-available Gradle distribution to enable consistent builds.

### Execution Workflow

1. **Start Next.js Server**: Run `npm run dev` in the background.
2. **Configure Android App**: Update `MainActivity.java` with the `localhost` URL.
3. **Build & Install**:
   - Navigate to the `android/` directory.
   - Run `./gradlew installDebug` to build and install the app on the device.
4. **Port Forwarding**: Run `adb reverse tcp:3000 tcp:3000` to link the device's port 3000 to the machine's port 3000.
5. **Launch**: Launch the `com.speakmind` application on the device.

## Verification Plan

### Automated Verification
- Check `adb shell pm list packages com.speakmind` to confirm installation.
- Check `adb reverse --list` to confirm port forwarding.

### Manual Verification
- Observe the device screen via `take_screenshot` or `ui_state` to ensure the SpeakMind app is visible and loading the Next.js content.
