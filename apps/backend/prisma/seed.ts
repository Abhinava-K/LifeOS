/**
 * LifeOS Database Seeding Script (Task 1.3 - Database Layer)
 * Populates initial test user, tasks, habits, sample expenses, and notes
 */

import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting LifeOS Database Seed...');

  const passwordHash = await argon2.hash('LifeOS@Secure2026!');

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@lifeos.ai' },
    update: {},
    create: {
      email: 'demo@lifeos.ai',
      passwordHash,
      fullName: 'Jahaan Suthar',
      role: 'USER',
      bio: 'Database & Frontend Lead building LifeOS Second Brain',
      locale: 'en-US',
      timezone: 'America/New_York',
      settings: {
        create: {
          theme: 'DARK',
          language: 'en',
          emailNotifications: true,
          pushNotifications: true,
          dailyDigest: true,
        },
      },
      privacy: {
        create: {
          profileVisibility: 'PRIVATE',
          dataProcessingConsent: true,
          marketingConsent: false,
          analyticsConsent: true,
        },
      },
    },
  });

  console.log(`✅ Seeded demo user: ${user.email} (${user.id})`);

  // Create initial tasks
  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        title: 'Review IEEE 830 SRS Specification',
        description: 'Ensure all functional requirement tags match architecture freeze',
        priority: 'URGENT_IMPORTANT',
        status: 'COMPLETED',
      },
      {
        userId: user.id,
        title: 'Initialize React Native Thin Client Navigation',
        description: 'Implement 5-tab navigation bar with Zustand and TanStack Query',
        priority: 'NOT_URGENT_IMPORTANT',
        status: 'IN_PROGRESS',
      },
      {
        userId: user.id,
        title: 'Configure PostgreSQL 15 & pgvector extension',
        description: 'Verify vector index and schema relations in Docker',
        priority: 'URGENT_IMPORTANT',
        status: 'COMPLETED',
      },
    ],
    skipDuplicates: true,
  });

  // Create initial habits
  await prisma.habit.createMany({
    data: [
      {
        userId: user.id,
        title: 'Morning Daily Briefing Review',
        frequency: 'DAILY',
        targetDaysPerWeek: 7,
        currentStreak: 12,
        longestStreak: 15,
      },
      {
        userId: user.id,
        title: 'Log Daily Expenses & Receipts',
        frequency: 'DAILY',
        targetDaysPerWeek: 7,
        currentStreak: 8,
        longestStreak: 14,
      },
    ],
    skipDuplicates: true,
  });

  // Create initial notes
  await prisma.note.create({
    data: {
      userId: user.id,
      title: 'LifeOS Architecture Decisions (ADR-001)',
      content:
        '# ADR-001: Modular Monolith vs Microservices\n\nWe selected a NestJS Modular Monolith with dedicated FastAPI CrewAI service. This avoids distributed transaction overhead while allowing independent AI scaling.',
      tags: ['architecture', 'backend', 'v1'],
      wikilinks: ['ADR-002', 'System-Overview'],
      isPinned: true,
    },
  });

  console.log('🎉 LifeOS Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
