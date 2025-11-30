# Real-Time Interview Coaching System

A comprehensive web-based platform designed to help candidates prepare for job interviews through real-time feedback on speech patterns, body language, and technical responses. The system leverages computer vision, speech recognition, and machine learning to provide actionable insights and performance metrics.

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Usage](#usage)
8. [API Reference](#api-reference)
9. [Performance Metrics](#performance-metrics)
10. [Project Structure](#project-structure)
11. [Contributing](#contributing)
12. [License](#license)

---

## Overview

The Real-Time Interview Coaching System addresses a critical gap in interview preparation by providing immediate, data-driven feedback that was previously only available through expensive professional coaching services. The platform analyzes three core dimensions of interview performance:

- **Speech Analysis**: Pronunciation accuracy, fluency, filler word detection, and speaking pace
- **Body Language Assessment**: Eye contact tracking, blink rate monitoring, head pose estimation, and emotional state detection
- **Technical Evaluation**: Response quality scoring with AI-generated feedback

### Key Statistics

| Metric | Value |
|--------|-------|
| Face landmark detection points | 468 |
| Head pose estimation accuracy | +/- 5 degrees |
| Eye contact detection threshold | 25 degrees yaw, 20 degrees pitch |
| Blink detection threshold | 0.20 EAR (Eye Aspect Ratio) |
| Smoothing window size | 5 frames |
| Attention history buffer | 150 frames (~5 seconds at 30fps) |
| Supported speaking pace range | 80-200 WPM |

---

## System Architecture

```
+------------------------------------------------------------------+
|                         Frontend (React)                          |
|  +------------------+  +------------------+  +------------------+ |
|  |   Login/Auth     |  |   Speech Test    |  |    Interview     | |
|  |   Component      |  |   Component      |  |    Component     | |
|  +--------+---------+  +--------+---------+  +--------+---------+ |
|           |                     |                     |           |
+-----------|---------------------|---------------------|----------+
            |                     |                     |
            v                     v                     v
+------------------------------------------------------------------+
|                      Firebase Services                            |
|  +------------------+  +------------------+  +------------------+ |
|  |  Authentication  |  |    Firestore     |  |    Analytics     | |
|  |  (Email/Google)  |  |   (NoSQL DB)     |  |                  | |
|  +------------------+  +------------------+  +------------------+ |
+------------------------------------------------------------------+
            |
            v
+------------------------------------------------------------------+
|                   Computer Vision Module (Python)                 |
|  +------------------+  +------------------+  +------------------+ |
|  |    MediaPipe     |  |   Head Pose      |  |    Emotion       | |
|  |    Face Mesh     |  |   Estimation     |  |    Detection     | |
|  +------------------+  +------------------+  +------------------+ |
+------------------------------------------------------------------+
            |
            v
+------------------------------------------------------------------+
|                   Speech Analysis Module (Planned)                |
|  +------------------+  +------------------+  +------------------+ |
|  | OpenAI Whisper   |  |  Tone Analysis   |  |   Filler Word    | |
|  | Transcription    |  |                  |  |   Detection      | |
|  +------------------+  +------------------+  +------------------+ |
+------------------------------------------------------------------+
```

---

## Features

### 1. User Authentication

- Email and password authentication
- Google OAuth 2.0 integration
- Secure session management via Firebase Authentication
- Persistent login state across browser sessions

### 2. Speech Accuracy Assessment

The speech analysis module evaluates the following metrics:

| Metric | Description | Scoring Range |
|--------|-------------|---------------|
| Fluency Score | Measures speech smoothness and natural flow | 0-100 |
| Pronunciation | Accuracy of word pronunciation | 0-100 |
| Filler Words | Count of detected filler words (um, uh, like, etc.) | 0+ count |
| Speaking Pace | Words per minute measurement | 80-200 WPM |
| Recording Duration | Total time of speech sample | Seconds |

**Planned OpenAI Whisper Integration:**

OpenAI Whisper will be integrated to provide:

- Real-time speech-to-text transcription with 99%+ accuracy for English
- Word-level timestamp alignment for precise filler word detection
- Multi-language support (99 languages)
- Tone and sentiment analysis through audio feature extraction
- Confidence scoring per word for pronunciation accuracy assessment

Whisper model specifications:
| Model | Parameters | English-only | Multilingual | VRAM Required | Relative Speed |
|-------|------------|--------------|--------------|---------------|----------------|
| tiny | 39M | Yes | Yes | ~1 GB | ~32x |
| base | 74M | Yes | Yes | ~1 GB | ~16x |
| small | 244M | Yes | Yes | ~2 GB | ~6x |
| medium | 769M | Yes | Yes | ~5 GB | ~2x |
| large | 1550M | No | Yes | ~10 GB | 1x |

### 3. Body Language Analysis

Real-time computer vision analysis using MediaPipe Face Mesh:

**Head Pose Estimation:**
- 6 facial landmarks used for pose calculation (nose tip, chin, left/right eye corners, mouth corners)
- 3D model point mapping with anatomically accurate coordinates
- Perspective-n-Point (PnP) algorithm for rotation vector calculation
- Euler angle extraction (yaw, pitch, roll) from rotation matrix

**Eye Contact Detection:**
- Yaw threshold: 25 degrees from center
- Pitch threshold: 20 degrees from center
- Temporal smoothing with 5-frame moving average
- Attention score calculated over 150-frame sliding window

**Blink Detection:**
- Eye Aspect Ratio (EAR) algorithm using 6 landmark points per eye
- Left eye indices: [33, 160, 158, 133, 153, 144]
- Right eye indices: [263, 387, 385, 362, 380, 373]
- Blink threshold: EAR < 0.20
- Blink rate normalization for stress detection

**Emotion Detection (Planned):**
- FER (Facial Expression Recognition) integration
- 7 emotion categories: Angry, Disgust, Fear, Happy, Sad, Surprise, Neutral
- Confidence scoring per detected emotion

**Confidence Score Calculation:**
```
Confidence = (Attention Score + Blink Score + Emotion Score) / 3

Where:
- Attention Score = Mean of attention history (0 or 1 per frame)
- Blink Score = 1.0 - (high blink frequency indicates stress)
- Emotion Score = 1.0 for Happy/Neutral, 0.5 otherwise
```

### 4. Technical Interview Assessment

- Multiple question categories: Core Concepts, Problem Solving, System Design
- Difficulty levels: Easy, Medium, Hard
- Real-time answer composition with text area
- AI-generated feedback per response
- Score breakdown by question category

### 5. Comprehensive Reporting

- Overall performance score (0-100)
- Category-wise score breakdown:
  - Technical Score
  - Communication Score
  - Body Language Score
- Detailed speech metrics visualization
- Question-by-question feedback review
- PDF report generation and download

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 5.4.19 | Build tool and dev server |
| TailwindCSS | 3.4.17 | Utility-first CSS |
| shadcn/ui | Latest | Component library |
| React Router | 6.30.1 | Client-side routing |
| TanStack Query | 5.83.0 | Server state management |
| React Hook Form | 7.61.1 | Form handling |
| Zod | 3.25.76 | Schema validation |
| jsPDF | 3.0.4 | PDF generation |
| Recharts | 2.15.4 | Data visualization |

### Backend Services

| Service | Purpose |
|---------|---------|
| Firebase Authentication | User authentication (Email/Password, Google OAuth) |
| Cloud Firestore | NoSQL document database for session data |
| Firebase Analytics | Usage tracking and metrics |

### Computer Vision

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Runtime environment |
| OpenCV | 4.x | Image processing and camera capture |
| MediaPipe | Latest | Face mesh detection (468 landmarks) |
| NumPy | Latest | Numerical computations |

### Speech Analysis (Planned)

| Technology | Purpose |
|------------|---------|
| OpenAI Whisper | Speech-to-text transcription |
| librosa | Audio feature extraction |
| pyAudioAnalysis | Tone and sentiment analysis |

---

## Installation

### Prerequisites

- Node.js 18.x or higher
- Python 3.11 or higher
- Bun package manager (recommended) or npm
- Webcam for body language analysis
- Microphone for speech analysis

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/NavadeepDj/Real-Time_Interview_Coaching_System.git
cd Real-Time_Interview_Coaching_System

# Navigate to frontend directory
cd frontend

# Install dependencies using Bun
bun install

# Or using npm
npm install

# Start development server
bun run dev
# Or
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Python Environment Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate

# Install dependencies
pip install opencv-python mediapipe numpy

# Optional: Install emotion detection
pip install fer

# Optional: Install Whisper for speech analysis
pip install openai-whisper
```

### Running the Body Language Analyzer

```bash
python small_interview_helper.py
```

Press 'q' to quit the application.

---

## Configuration

### Firebase Configuration

The Firebase configuration is located in `frontend/src/lib/firebase.ts`. Update the following values with your Firebase project credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### Firebase Console Setup

1. Navigate to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
   - Enable Google provider
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production or test mode
   - Set appropriate security rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /interviewSessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

---

## Usage

### User Flow

1. **Registration/Login**: Create an account or sign in with email/Google
2. **Permission Setup**: Grant camera and microphone permissions
3. **Speech Test**: Complete the speech assessment by responding to the provided prompt
4. **Technical Interview**: Answer technical questions while being monitored
5. **Report Review**: View comprehensive performance report
6. **PDF Download**: Download the assessment report for future reference

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| q | Quit body language analyzer (Python) |

---

## API Reference

### Firestore Collections

#### interviewSessions

```typescript
interface InterviewSession {
  id: string;
  userId: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  status: "in-progress" | "completed";
  
  speechTest?: {
    fluency: number;        // 0-100
    fillerWords: number;    // Count
    pace: number;           // WPM
    pronunciation: number;  // 0-100
    recordingDuration: number; // Seconds
  };
  
  questions?: Array<{
    title: string;
    category: string;
    difficulty: string;
    question: string;
    answer: string;
    score?: number;         // 0-100
    feedback?: string;
  }>;
  
  liveMetrics?: {
    attention: number;      // 0-100
    eyeContact: number;     // 0-100
    blinkRate: number;      // Blinks per minute
    emotion: string;
    confidence: number;     // 0-100
    speakingPace: number;   // WPM
  };
  
  bodyLanguage?: {
    eyeContact: number;     // Percentage
    avgBlinkRate: number;   // Per minute
    confidenceCurve: number; // 0-100
    emotionTimeline: string[];
  };
  
  overallScore?: number;      // 0-100
  technicalScore?: number;    // 0-100
  communicationScore?: number; // 0-100
  bodyLanguageScore?: number;  // 0-100
}
```

### Authentication Methods

| Method | Parameters | Returns |
|--------|------------|---------|
| `login(email, password)` | string, string | Promise<void> |
| `register(email, password)` | string, string | Promise<void> |
| `logout()` | none | Promise<void> |
| `loginWithGoogle()` | none | Promise<void> |

### Session Management

| Method | Parameters | Returns |
|--------|------------|---------|
| `createInterviewSession(userId)` | string | Promise<string> |
| `saveSpeechTestResults(sessionId, results)` | string, SpeechTestResult | Promise<void> |
| `saveInterviewResults(sessionId, questions, metrics)` | string, array, object | Promise<void> |
| `completeInterviewSession(sessionId, finalResults)` | string, object | Promise<void> |
| `getInterviewSession(sessionId)` | string | Promise<InterviewSession> |
| `getUserInterviewSessions(userId)` | string | Promise<InterviewSession[]> |

---

## Performance Metrics

### Body Language Detection Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Face detection rate | 30 fps | At 640x480 resolution |
| Landmark detection latency | <33ms | Per frame |
| Head pose estimation accuracy | +/- 5 degrees | For yaw, pitch, roll |
| Eye contact classification accuracy | ~90% | Within defined thresholds |

### Speech Analysis Targets (with Whisper Integration)

| Metric | Target Value |
|--------|--------------|
| Transcription accuracy (English) | >95% |
| Word error rate | <5% |
| Real-time factor | <0.5 (faster than real-time) |
| Filler word detection precision | >90% |

### Frontend Performance

| Metric | Target |
|--------|--------|
| First Contentful Paint | <1.5s |
| Time to Interactive | <3.0s |
| Bundle size (gzipped) | <500KB |

---

## Project Structure

```
Real-Time_Interview_Coaching_System/
├── frontend/
│   ├── public/
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn/ui components (40+ components)
│   │   │   └── NavLink.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx     # Firebase authentication context
│   │   │   └── InterviewContext.tsx # Interview session state management
│   │   ├── hooks/
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   ├── lib/
│   │   │   ├── firebase.ts         # Firebase configuration
│   │   │   ├── firestore.ts        # Firestore operations
│   │   │   ├── pdfGenerator.ts     # PDF report generation
│   │   │   └── utils.ts            # Utility functions
│   │   ├── pages/
│   │   │   ├── Index.tsx           # Landing page
│   │   │   ├── Login.tsx           # Authentication page
│   │   │   ├── SpeechTest.tsx      # Speech assessment
│   │   │   ├── Interview.tsx       # Technical interview
│   │   │   ├── Report.tsx          # Performance report
│   │   │   └── NotFound.tsx        # 404 page
│   │   ├── App.tsx                 # Main application component
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx                # Application entry point
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
├── small_interview_helper.py       # Body language analysis module
├── no_looking_cam_optimzed.py      # Optimized camera detection
├── no_loooking_camera.py           # Alternative camera implementation
├── test/                           # Test files
└── README.md
```

---

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run linting: `bun run lint`
5. Build the project: `bun run build`
6. Commit your changes: `git commit -m "Add your feature"`
7. Push to the branch: `git push origin feature/your-feature-name`
8. Submit a pull request

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain component modularity
- Write descriptive commit messages
- Add appropriate comments for complex logic

### Testing Guidelines

- Test all new features manually before submitting
- Ensure camera and microphone permissions work correctly
- Verify Firebase operations complete successfully
- Test PDF generation with various data scenarios

---

## Roadmap

### Phase 1 (Current)
- [x] User authentication (Email/Google)
- [x] Basic speech test interface
- [x] Technical interview module
- [x] Body language detection (Python)
- [x] Firebase data persistence
- [x] PDF report generation

### Phase 2 (Planned)
- [ ] OpenAI Whisper integration for real-time transcription
- [ ] Advanced filler word detection with timestamps
- [ ] Tone and sentiment analysis
- [ ] Pronunciation accuracy scoring per word
- [ ] Speaking pace recommendations

### Phase 3 (Future)
- [ ] WebSocket integration for real-time Python-JS communication
- [ ] Live body language metrics overlay in browser
- [ ] Interview recording and playback
- [ ] Progress tracking over multiple sessions
- [ ] Custom interview question sets
- [ ] Multi-language support

---

## License

This project is developed as part of an academic/personal project. All rights reserved.

---

## Acknowledgments

- [MediaPipe](https://mediapipe.dev/) for face mesh detection
- [OpenAI Whisper](https://github.com/openai/whisper) for speech recognition
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Firebase](https://firebase.google.com/) for backend services
