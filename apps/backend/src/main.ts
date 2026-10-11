import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS & Global Input Validation Pipe
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set Global REST API Prefix
  app.setGlobalPrefix('api/v1');

  // Swagger OpenAPI Specification (IEEE 830 SRS Complete Coverage)
  const config = new DocumentBuilder()
    .setTitle('LifeOS Modular Monolith Backend API')
    .setDescription(
      'REST API contracts, OpenAPI specifications, and subsystem documentation for LifeOS Personal Life Management Platform (Phases 1-6 Complete).',
    )
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-Auth')
    .addTag('System Diagnostics & Health (Phase 6: REQ-NFR)', 'Subsystem readiness, uptime, and latency benchmarks')
    .addTag('Authentication Engine (REQ-AUTH)', 'OAuth2, JWT authentication, and Argon2id security')
    .addTag('User Management & GDPR (REQ-USER)', 'User profiles, settings, and GDPR Art. 17/20 data portability')
    .addTag('AI Gateway & Multi-Agent (REQ-AIGW)', 'Unified LLM routing, SSE streaming, and CrewAI delegation')
    .addTag('Planner Subsystem (REQ-PLAN)', 'Tasks, calendar time blocking, habits, and daily briefings')
    .addTag('Notes & Knowledge Base (REQ-NOTE)', 'Markdown notes vault and bi-directional graph linking')
    .addTag('Expense Engine & OCR (REQ-EXP)', 'Receipt OCR data extraction and spend analytics')
    .addTag('Document Vault & Storage (REQ-DOC)', '25MB vault, document indexing, and PDF storage')
    .addTag('Study Hub & Flashcards (REQ-STDY)', 'SuperMemo-2 (SM-2) spaced repetition algorithm and quiz engine')
    .addTag('Long-Term Memory Vault (REQ-MEM)', '768-dim semantic recall, recency decay, and prompt injection')
    .addTag('Universal Hybrid Search (REQ-SRCH)', 'Reciprocal Rank Fusion (RRF, k=60) across all entities')
    .addTag('Google Workspace Sync (REQ-GGL)', 'Calendar, Gmail, Drive, and Contacts bi-directional sync')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 LifeOS Backend Service running on port ${port}`);
  console.log(`📑 OpenAPI Swagger Documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
