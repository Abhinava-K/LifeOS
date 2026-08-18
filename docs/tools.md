# Note: Technology Stack & Tools Used

This project follows a modern microservice-based architecture using TypeScript and Python. The selected technologies prioritize maintainability, scalability, performance, and production readiness while keeping the overall system lightweight.

---

## 1. Frontend

### React Native
- Cross-platform mobile development (Android & iOS)
- Single codebase
- Native performance
- Faster development cycle

### Expo (Development)
- Rapid prototyping
- Hot Reload
- Native API support
- Easy testing

### TypeScript
- Static typing
- Better maintainability
- Prevents runtime errors

### Axios
- Communication between the mobile application and backend services
- Centralized API management
- Authentication interceptor support
- Automatic token refresh
- Error handling

### Zustand
- Lightweight global state management
- User session
- Theme
- Temporary application state

### TanStack Query (React Query)
- Server state management
- Automatic caching
- Background synchronization
- Request deduplication

### React Navigation
- Navigation between application screens

### React Hook Form + Zod
- Form handling
- Input validation
- Type-safe validation

### MMKV Storage
- High-performance local storage
- Secure token storage
- Offline application data

---

## 2. Backend

### NestJS
Primary backend framework responsible for

- REST APIs
- Authentication
- Authorization
- Business logic
- API Gateway
- Database communication

### Prisma ORM

Responsible for

- Database migrations
- Type-safe queries
- Database schema management
- Automatic model generation

### Swagger (OpenAPI)

Used for

- API documentation
- Frontend-backend contract
- API testing
- Automatic documentation generation

### JWT Authentication

Used for

- User authentication
- Access Tokens
- Refresh Tokens

### Argon2

Used for

- Password hashing
- Secure credential storage

---

## 3. AI Service

### Python FastAPI

Dedicated AI microservice responsible for

- AI request handling
- Intent routing
- Prompt construction
- Memory retrieval
- Tool execution
- LLM communication

This service is completely independent of the main NestJS backend.

---

## 4. Database

### PostgreSQL

Primary relational database

Stores

- Users
- Tasks
- Calendar
- Expenses
- Notes
- Documents
- Notifications
- AI Conversations
- Application Settings

Reason

- ACID compliant
- Excellent relational support
- High performance
- Mature ecosystem

---

### pgvector

PostgreSQL extension used for

- Semantic Search
- AI Memory
- Embeddings
- Retrieval Augmented Generation (RAG)

---

## 5. Cache & Queue

### Redis

Used for

- Session caching
- AI response caching
- API caching
- OTP storage
- Rate limiting
- Background queues

### BullMQ

Built on Redis

Responsible for

- Notification jobs
- Background processing
- Email queue
- AI preprocessing
- Scheduled tasks

---

## 6. Storage

### Azure Blob Storage

Stores

- PDFs
- Images
- Audio
- Receipts
- Attachments
- User uploads

---

## 7. AI Models

### Google Gemini

Primary Large Language Model

Used for

- Chat
- Planning
- Summarization
- Reasoning
- Structured responses

### Groq

Used when

- Low latency is required
- Fast inference
- Real-time responses

---

## 8. Search

Hybrid Search

Combines

- PostgreSQL Full Text Search
- pgvector Semantic Search

Provides

- Keyword search
- Semantic search
- Context-aware retrieval

---

## 9. Notifications

Firebase Cloud Messaging (FCM)

Used for

- Push notifications
- Reminder alerts
- Planner notifications

---

## 10. Documentation

Swagger
Markdown
Mermaid Diagrams
Figma

---

## 11. Version Control

Git
GitHub

Branch Strategy

- main
- develop
- feature/*
- hotfix/*
- release/*

---

## 12. DevOps

Docker

Containerization

GitHub Actions

CI/CD Pipeline

Azure

Deployment Platform

---

## 13. Testing

Frontend

- Jest
- React Native Testing Library

Backend

- Jest
- Supertest

API

- Swagger Testing
- Postman

Performance

- Load Testing
- Stress Testing
- Integration Testing

---

## 14. Shared Packages

The following shared packages are maintained to ensure frontend-backend synchronization.

packages/

- shared-types
- shared-api
- shared-utils
- shared-config
- shared-constants

These packages eliminate duplicate model definitions and ensure identical API contracts throughout the project.