# LifeOS — AI-Orchestrated Personal Productivity Substrate

> An AI-powered personal life management platform built as a cross-platform React Native mobile application, backed by a NestJS modular monolith backend and a Python CrewAI orchestration service.

---

## 🏗️ Monorepo Architecture Overview

```
LifeOS/
├── apps/
│   ├── backend/             # NestJS Modular Monolith (REST API, Auth, Gateway)
│   ├── mobile/              # React Native (Expo) Thin Client
│   └── admin/               # Admin Management Dashboard
├── packages/
│   ├── shared-types/        # Shared DTOs, interfaces & domain models
│   ├── shared-api/          # API specs & Swagger contracts
│   ├── shared-utils/        # Shared helper utilities & schema validators
│   └── shared-config/       # Shared TypeScript & ESLint configs
├── infrastructure/
│   └── docker/              # Docker Compose (PostgreSQL 15, pgvector, Redis)
└── docs/                    # Architecture & SRS specifications
```

---

## 🚀 Key Technologies

- **Frontend:** React Native (Expo), TypeScript, Zustand, TanStack Query, Axios
- **Backend:** NestJS, Prisma ORM, Swagger, Argon2id, Dual-Token JWT
- **AI Microservice:** Python FastAPI, CrewAI, Google Gemini, Groq
- **Database Layer:** PostgreSQL 15 (`pgvector`), Redis, BullMQ
- **Storage & Services:** Azure Blob Storage, Google Workspace API, FCM Push

---

## 🛠️ Quick Start & Setup

### 1. Start Infrastructure Services (Docker)
```bash
cd infrastructure/docker
docker-compose up -d
```

### 2. Install Monorepo Dependencies
```bash
npm install
```

### 3. Run Backend Development Server
```bash
cd apps/backend
npm run start:dev
```

---

## 📜 Documentation

Detailed specifications and engineering guides are available in the [`markdowns`](../markdowns) directory:
- [Software Requirements Specification (SRS)](../markdowns/srs.tex)
- [Project Status Ledger](../markdowns/status.md)
- [Gantt Schedule & Milestones](../markdowns/gantt.md)
- [Engineering Workflow](../markdowns/workflow.md)
- [Technology Stack Catalog](../markdowns/tools.md)
