# SpeakMind 🧠✨

**SpeakMind** is a comprehensive, cross-platform mental health and wellness companion application. Built with a modern web stack and packaged natively for Android, it helps users reflect, log their emotions, and interact with an empathetic AI assistant in a safe environment.

## 🌟 Features

- **Empathetic AI Companion:** A conversational AI powered by NVIDIA NIM that acts as a sounding board. It features a background emotion analysis engine and built-in safety/distress checks to ensure user well-being.
- **Dynamic Wellness Dashboard:** A fully interactive dashboard that visualizes your mental health journey. Features a beautiful, interactive **Daily Streak Tracker** powered by `framer-motion` that breaks down daily activities.
- **Daily Check-ins:** Log your mood daily to track your emotional trends over time.
- **Wellness Journal:** A private space to write, reflect, and document your thoughts.
- **Wellness Activities:** A curated list of exercises (e.g., meditation, deep breathing) to help you cope and find balance.
- **Cross-Platform Support:** Fully functional as a responsive Next.js web application and as an installable Android APK.

## 🛠️ Technology Stack

**Frontend / Web Application:**
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React

**Backend & Data Layer:**
- **Database ORM:** Prisma Next
- **AI Integration:** NVIDIA NIM (via custom `NvidiaProvider` and `ChatPipeline`)

**Mobile Application:**
- **Platform:** Android (Java)
- **Architecture:** Native Android WebView wrapping the responsive web deployment, enabling a seamless cross-platform experience.

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/D-Harsha-vardhan/Speak-Mind.git
   cd Speak-Mind
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your required keys (e.g., Database URLs, AI API Keys).
   ```env
   # Example
   NVIDIA_API_KEY=your_api_key_here
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
  

## 📱 Android App Setup

SpeakMind can be compiled into a native Android APK.

1. Ensure the web application is hosted online (e.g., via Vercel) or running locally on your Wi-Fi network (bound to `0.0.0.0`).
2. Open `android/app/src/main/java/com/speakmind/MainActivity.java`.
3. Update the `APP_URL` variable to point to your live deployment URL or your computer's local IP address.
   ```java
   private static final String APP_URL = "https://your-deployment-url.vercel.app";
   ```
4. Build the APK using Android Studio or Gradle.

## 🔒 Safety & Privacy First
The AI Chat Pipeline is built with user safety in mind. All messages pass through a localized `SafetyService` that runs distress evaluations in parallel with message generation, ensuring that harmful or crisis-level inputs are met with appropriate resources rather than standard AI generation.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/D-Harsha-vardhan/Speak-Mind/issues).

---
*Take a deep breath. Your mental health matters.* 💙
4566
