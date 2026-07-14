# AI-Powered Mock Interview Platform with Spoken Analytics 🎙️🤖

Welcome to the **AI Mock Interview Platform**! This application is designed to simulate realistic technology and soft-skills interviews, providing candidates with real-time vocal telemetries (WPM tracking, linguistic filler usage, speech clarity metrics, and voice-wave visualizers) integrated with structured technical evaluation powered by Gemini AI.

This guide will show you how to set up, configure, and run this project locally in **VS Code** with zero errors or warnings.

---

## 🛠️ Features Included

- **Multi-domain Interviewing**: Select from Frontend, Backend, Mobile, DevOps, DSA, PM, and Core Computer Science Fundamentals.
- **Interactive Speech Analytics & Waveforms**: Tracks your spoken response duration, real-time pace in Words Per Minute (WPM), and counts filler phrases ("like", "basically", "actually", "um", "uh", "you know"). Includes an interactive AudioContext-driven canvas wave recorder.
- **Interviewer Personas**: Toggle interviewer styles from "Friendly" (constructive, warm) to "Stern" (highly professional, rigorous) or "Technical Expert".
- **Instant Generative AI Feedback**: Receives modular scoring, full grammatical clarity remarks, ideal structural answers, deep conceptual explanations, and direct comparison checklists.
- **High-Fidelity Dashboard & Roadmaps**: Compiles a career roadmap and dynamic charts analyzing technical, conversational, and delivery performance over time.

---

## 🚀 Step-by-Step Local Setup in VS Code

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or later is recommended, Node v20+ works excellently)
- **NPM** (comes pre-bundled with Node.js)
- **Git**

### 2. Open Project in VS Code
Clone or unzip this project directory, open your terminal (Ctrl+` or Cmd+`), and navigate to the project directory:
```bash
# Open directory (or select File > Open Folder in VS Code)
cd ai-mock-interview-platform
```

### 3. Install Dependencies
Run the install command to fetch all required libraries (Vite, React 19, Recharts, Express, Lucide-react, motion, Tailwind v4, `@google/genai` SDK):
```bash
npm install
```

### 4. Configure Environment Variables
You need a Gemini API Key to power the interviewer's intelligence.
1. In the root directory, create a new file named `.env` based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Open the newly created `.env` file and replace the placeholder value with your actual Google Gemini API key:
   ```env
   # .env
   GEMINI_API_KEY="AIzaSyYourActualKeyFromGoogleAIStudio"
   APP_URL="http://localhost:3000"
   ```
   *(To get a free key, visit [Google AI Studio](https://aistudio.google.com/))*

---

## 💻 Running the Application

This is a full-stack configuration consisting of a lightweight Express backend proxy alongside a fast Vite-driven React single-page frontend.

To spin up both simultaneously in dev mode:
```bash
npm run dev
```

You should see an output similar to:
```text
Server running on http://localhost:3000
```

1. Open your web browser and navigate to **`http://localhost:3000`**.
2. Press **Start Interview**, select your settings/domain, allow microphone access when prompted, and start recording!

---

## 🔍 Directory Structure of files

- `server.ts` - The entry point for the Express backend server (integrates Vite server-side middleware for local dev, and server-side routing in prod).
- `src/main.tsx` & `src/App.tsx` - App bootstrappers and view coordinates.
- `src/components/` - The UI module folder containing:
  - `InterviewSession.tsx`: The primary interactive panel tracking spoken analytics, microphones, and question/answer flows.
  - `FeedbackDashboard.tsx`: Generates statistics, roadmaps, and historic graphs.
  - `HomeDashboard.tsx`: Selection boards and setup menus.
- `src/services/geminiService.ts` - The AI orchestration interface interfacing safely and lazily with the `@google/genai` client library.
- `vite.config.ts` & `tsconfig.json` - Build parameters, module resolutions, and aliases.

---

## 💡 Troubleshooting & Tips

- **Microphone Permissions**: Ensure your VS Code terminal running browser instances (or localhost client) has standard OS-level microphone approvals. If microphone access is rejected, the app safely defaults to text-based inputs and mock waveforms so you can still test.
- **Port Conflicts**: If port `3000` is currently used by another process, you can change `PORT = 3000;` on line 11 of `server.ts` to another port (e.g. `PORT = 3001`).
- **No Emit Warns**: `npm run lint` uses TypeScript strictly to verify types without outputting code. This ensures 100% type safety during checkouts.

Enjoy practicing your interviews! 🚀
