# 🚀 Rtios AI - Executive Intelligence Suite

> **Revolutionizing the job search experience with AI-powered strategic intelligence**

[![React](https://img.shields.io/badge/React-19.2.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-yellow.svg)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0.9-orange.svg)](https://zustand-demo.pmnd.rs/)

---

## 🏗️ Project Overview

**Rtios AI** transforms the chaotic job search process into a strategic, data-driven operation. By leveraging advanced AI, it empowers executives to navigate the modern career landscape with precision.

### 📚 Documentation Hub
- **[Architecture Guide](./ARCHITECTURE.md)**: Deep dive into system design, state management, and component hierarchy.
- **[Development Guide](./DEVELOPMENT.md)**: Setup instructions, workflows, and code standards.
- **[Changelog](./CHANGELOG.md)**: Version history and release notes.

---

## ✨ Key Features

- **📄 Resume Analysis**: Smart parsing and ATS compatibility scoring.
- **💼 Job Tracking**: Manage multiple applications with dedicated workspaces.
- **🤖 AI Intelligence**:
  - **Company Research**: Deep market insights.
  - **Cover Letters**: Tailored narratives.
  - **LinkedIn Messages**: Strategic networking outreach.
  - **Interview Prep**: Custom question simulation.
- **📊 Executive Dashboard**: Real-time overview of active strategies.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript (Strict Mode)
- **Build Tool**: Vite (Lightning fast HMR)
- **State Management**: Zustand (with Persistence)
- **Routing**: React Router v6 (Lazy Loading)
- **Styling**: Tailwind CSS + Custom Design System
- **Visualization**: Recharts

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/Terry-Mathew/rtios-ai
npm install
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/           # UI Components
│   ├── features/        # Business features (CoverLetter, LinkedIn)
│   ├── layout/          # Sidebar, wrappers
│   └── ui/              # Shared atoms (Toast, Inputs)
├── domains/             # Business Logic (DDD)
│   ├── career/          # Resume logic
│   └── intelligence/    # AI Services
├── routes/              # Page views (Lazy loaded)
├── stores/             # Zustand stores
└── types/              # TypeScript definitions
```

---

## 💡 Key Key Decisions

1.  **Zustand over Redux**: We chose Zustand for its simplicity, hook-based API, and built-in persistence, which fits our "workspace" model perfectly without boilerplate.
2.  **Error Boundaries**: Implemented at both the App and Feature level. If the "Cover Letter Generator" crashes, the rest of the dashboard remains usable.
3.  **Strict TypeScript**: Enforced `strict: true` to prevent runtime errors and ensure self-documenting code.
4.  **Code Splitting**: Used `React.lazy` for routes and heavy chart components to ensure the initial load is under 200kb.

---

## 📄 License
Proprietary software. All rights reserved.