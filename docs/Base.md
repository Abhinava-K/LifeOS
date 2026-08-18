> Status: Draft v1 (Frozen before development)
# Project Vision

LifeOS is an AI-powered **Personal Life Management Platform** built as a **React Native mobile application**.

It is **NOT** an operating system.

It acts as an intelligent layer over a user's digital life by connecting:

- Notes
- Tasks
- Calendar
- Goals
- Habits
- Expenses
- Documents
- Health
- Study
- Google Services
- AI Memory

The objective is to become the user's **Second Brain**.

---

# Development Philosophy

## Primary Goals

- Learn backend engineering properly.
- Learn CrewAI and AI orchestration.
- Build an impressive resume-worthy project.
- Build something that can actually evolve into a startup.

---

## Development Strategy

- Backend First
- UI afterwards
- Every phase should produce a fully testable application.
- AI should enhance the application—not replace traditional backend architecture.

---

# Overall Architecture

```text
React Native Client

        │
        │ Axios (REST API)
        ▼

NestJS Backend (TypeScript)

        │
        ├──────── PostgreSQL
        ├──────── Redis
        ├──────── Blob Storage
        └──────── Google APIs

        │

AI Gateway

        │

CrewAI Service (Python)

        │

Gemini / Groq
```

---

# Project Structure

```text
LifeOS/

├── client/
│
├── server/
│
├── crewai/
│
├── docs/
│
├── docker-compose.yml
│
├── README.md
│
└── .env.example
```

---

# Client Architecture

The client is responsible only for:

- UI
- Navigation
- Local State
- Authentication State
- Calling APIs

Business logic belongs in the backend.

---

## Client Folder Structure

```text
client/

src/

├── assets/

├── components/

│   ├── common/
│   ├── cards/
│   ├── forms/
│   ├── charts/
│   ├── modals/
│   └── ai/

├── screens/

│   SplashScreen.tsx

│   LoginScreen.tsx

│   HomeScreen.tsx

│   AIScreen.tsx

│   PlannerScreen.tsx

│   LibraryScreen.tsx

│   ProfileScreen.tsx

│   Notes/

│   Expenses/

│   Study/

│   Settings/

├── navigation/

│   AppNavigator.tsx

│   AuthNavigator.tsx

│   BottomTabs.tsx

├── services/

│   api.ts

│   auth.ts

│   notes.ts

│   planner.ts

│   ai.ts

├── hooks/

├── store/

├── utils/

├── types/

└── App.tsx
```

---

# Main Navigation

Only five primary tabs.

```text
🏠 Home

🤖 AI

📅 Planner

📚 Library

👤 Profile
```

---

# Home

Contains

- Daily Brief
- Today's Schedule
- Task Preview
- Budget Snapshot
- Habit Snapshot
- AI Suggestions
- Recent Activity

---

# AI

Contains

- Chat
- Voice
- Camera Upload
- Quick Actions
- Conversation History

---

# Planner

Unified productivity hub.

Contains

- Calendar
- Tasks
- Goals
- Habits

---

# Library

Contains

- Notes
- Documents
- Receipts
- Study Material
- Universal Search

---

# Profile

Contains

- Settings
- Integrations
- Account
- Memory
- Subscription

---

# Google Integrations

Only integrations that significantly improve LifeOS.

## MVP

### Google Sign-In

Authentication.

---

### Google Calendar

- Events
- Scheduling
- Time Blocking
- Daily Planning

---

### Gmail

- Email summaries
- Reminder suggestions
- Invoice detection
- Travel extraction

---

### Google Drive

- PDFs
- Receipts
- Notes
- File backup

---

### Google Contacts

- Smart meeting suggestions
- Relationship awareness
- Contact lookup

---

### Google Photos

- Semantic photo search
- Passport search
- Receipt lookup
- Travel memories

---

## Future

- Google Docs
- Google Sheets

---

## Not Included

- Google Tasks
- Google Keep
- YouTube Music
- Google Slides

Reason:
LifeOS already provides these capabilities.

---

# Backend Architecture

Backend is a Modular Monolith.

NOT Microservices.

---

# Server Folder Structure

```text
server/

src/

├── main.ts

├── app.module.ts

├── config/

├── common/

│   guards/

│   middleware/

│   interceptors/

│   decorators/

│   filters/

├── database/

│   prisma.module.ts

│   prisma.service.ts

├── auth/

├── users/

├── notes/

├── planner/

├── expenses/

├── documents/

├── study/

├── memory/

├── search/

├── integrations/

│   google/

├── ai/

│   ai.controller.ts

│   ai.service.ts

│   ai.module.ts

│   gateway/

│       gateway.service.ts

│   providers/

│       gemini.provider.ts

│       groq.provider.ts

│   prompts/

└── utils/
```

---

# Backend Responsibilities

Backend owns:

- Authentication
- Authorization
- Validation
- Business Logic
- CRUD
- Database
- Google APIs
- Search
- Memory
- AI Context Building

CrewAI owns:

- Reasoning
- Planning
- Recommendations
- Multi-agent workflows

---

# AI Architecture

CrewAI is NOT the backend.

CrewAI is an AI orchestration service.

---

# CrewAI Folder Structure

```text
crewai/

app/

├── main.py

├── api/

│   routes.py

├── agents/

│   planner.py

│   finance.py

│   study.py

│   memory.py

├── crews/

│   planner_crew.py

│   finance_crew.py

├── flows/

│   daily_brief.py

│   weekly_review.py

│   schedule_optimizer.py

├── tools/

│   notes.py

│   planner.py

│   expenses.py

│   memory.py

├── providers/

│   gemini.py

│   groq.py

└── config/
```

---

# AI Gateway

Every AI request passes through the AI Gateway.

No module communicates directly with CrewAI.

```text
Notes

↓

AI Service

↓

Gateway

↓

CrewAI
```

```text
Planner

↓

AI Service

↓

Gateway

↓

CrewAI
```

```text
Expenses

↓

AI Service

↓

Gateway

↓

CrewAI
```

---

# AI Gateway Responsibilities

## 1. Detect Intent

Example

- Plan Day
- Analyze Expense
- Summarize Note
- Weekly Review

---

## 2. Build Context

Collect data from backend.

Example

- Tasks
- Calendar
- Goals
- Habits
- Memory
- Preferences

CrewAI never queries PostgreSQL directly.

---

## 3. Choose Crew

Examples

- Planner Crew
- Finance Crew
- Study Crew
- Memory Crew

---

## 4. Choose Model

Examples

Simple Task

↓

Gemini Flash

Complex Task

↓

Gemini Pro

Ultra Fast

↓

Groq

Model switching happens only inside Gateway.

---

## 5. Logging

Track

- Tokens
- Cost
- Latency
- Crew
- Model
- User

---

# Request Flow

## Normal Backend Request

```text
React Native

↓

Axios

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Response
```

---

## AI Request

```text
React Native

↓

Axios

↓

AI Controller

↓

AI Service

↓

Gateway

↓

CrewAI

↓

Selected Crew

↓

Gemini / Groq

↓

CrewAI Response

↓

Gateway

↓

AI Service

↓

React Native
```

---

# Database Ownership

Only NestJS owns data.

```text
PostgreSQL

↓

NestJS

↓

CrewAI
```

Never

```text
CrewAI

↓

Database
```

---

# Technologies

## Client

- React Native
- TypeScript
- React Navigation
- Zustand
- TanStack Query
- Axios

---

## Backend

- NestJS
- Prisma
- PostgreSQL
- Redis
- JWT
- Google OAuth

---

## AI

- CrewAI
- Gemini
- Groq
- FastAPI

---

# MVP Features

Authentication

- Google Login
- Email Login

---

Notes

- CRUD
- AI Summary
- Search

---

Planner

- Calendar
- Tasks
- Goals
- Habits

---

Expenses

- Manual Entry
- Receipt OCR
- AI Categorization

---

Documents

- Upload
- Organize
- Search

---

Memory

- Long-term user memory
- User-controlled

---

AI

- Chat
- Daily Brief
- Recommendations

---

Search

- Universal Search
- Semantic Search

---

Google Integrations

- Calendar
- Gmail
- Drive
- Contacts
- Photos

---

# Design Principles

- Backend First
- Modular Monolith
- Thin Client
- AI as an Enhancement Layer
- Backend Owns Data
- CrewAI Owns Reasoning
- One AI Gateway
- Cloud Agnostic
- Docker Friendly
- Every Phase Must Be Runnable
- Every Phase Must Be Testable

---

# Guiding Principle

> LifeOS should never feel like ten separate productivity apps.

It should feel like **one intelligent assistant** that understands relationships between all of the user's information and helps them make better decisions every day.
