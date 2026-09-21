import { Injectable, NotFoundException } from '@nestjs/common';
import {
  GoalDto,
  GoalCategory,
  GoalMilestoneDto,
} from '@lifeos/shared-types';
import { CreateGoalDto, UpdateGoalDto } from '../dto/planner.dto';
import * as crypto from 'crypto';

@Injectable()
export class GoalService {
  private goals: Map<string, GoalDto> = new Map();

  constructor() {
    this.seedSampleGoals();
  }

  private seedSampleGoals(): void {
    const defaultUserId = 'user_vit_student_001';
    const sampleGoals: Array<Omit<GoalDto, 'id' | 'createdAt' | 'updatedAt'>> = [
      {
        userId: defaultUserId,
        title: 'Complete SWE Project with Distinction & Full Marks',
        description: 'Implement 6 phases including AI Gateway, Multi-Agent & pgvector',
        category: GoalCategory.CAREER_STUDY,
        targetDate: '2026-11-15T00:00:00.000Z',
        progressPercentage: 66,
        isArchived: false,
        milestones: [
          { id: 'm-1', title: 'Phase 1: Architecture & IEEE 830 SRS', isCompleted: true, dueDate: '2026-07-31T00:00:00.000Z' },
          { id: 'm-2', title: 'Phase 2: Auth Engine & User Store', isCompleted: true, dueDate: '2026-08-21T00:00:00.000Z' },
          { id: 'm-3', title: 'Phase 3: AI Gateway & CrewAI Microservice', isCompleted: true, dueDate: '2026-09-11T00:00:00.000Z' },
          { id: 'm-4', title: 'Phase 4: Planner & Core Domain Subsystems', isCompleted: false, dueDate: '2026-10-09T00:00:00.000Z' },
          { id: 'm-5', title: 'Phase 5: Advanced Intelligence & Google Sync', isCompleted: false, dueDate: '2026-10-23T00:00:00.000Z' },
        ],
      },
      {
        userId: defaultUserId,
        title: 'Master Cloud Native Architecture on AWS / GCP',
        description: 'Learn Kubernetes, Docker containerization, and Serverless deployment',
        category: GoalCategory.PERSONAL_GROWTH,
        targetDate: '2026-12-31T00:00:00.000Z',
        progressPercentage: 40,
        isArchived: false,
        milestones: [
          { id: 'm-6', title: 'Docker Compose Local Infrastructure', isCompleted: true, dueDate: '2026-07-27T00:00:00.000Z' },
          { id: 'm-7', title: 'Kubernetes Pods & Ingress Configs', isCompleted: false, dueDate: '2026-10-15T00:00:00.000Z' },
        ],
      },
    ];

    for (const g of sampleGoals) {
      const id = `goal_${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      this.goals.set(id, {
        ...g,
        id,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  async findByUser(
    userId: string,
    filter?: { category?: GoalCategory; includeArchived?: boolean },
  ): Promise<GoalDto[]> {
    let list = Array.from(this.goals.values()).filter((g) => g.userId === userId);

    if (filter?.category) {
      list = list.filter((g) => g.category === filter.category);
    }
    if (!filter?.includeArchived) {
      list = list.filter((g) => !g.isArchived);
    }

    return list.sort(
      (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime(),
    );
  }

  async findById(userId: string, goalId: string): Promise<GoalDto> {
    const goal = this.goals.get(goalId);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundException(`Goal with ID ${goalId} not found`);
    }
    return goal;
  }

  async create(userId: string, dto: CreateGoalDto): Promise<GoalDto> {
    const id = `goal_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const milestones: GoalMilestoneDto[] = (dto.milestones || []).map((m, idx) => ({
      id: `ms_${id}_${idx + 1}`,
      title: m.title,
      isCompleted: !!m.isCompleted,
      dueDate: m.dueDate || null,
    }));

    // Auto-calculate progress if milestones exist and percentage wasn't explicitly given
    let progress = dto.progressPercentage ?? 0;
    if (dto.progressPercentage === undefined && milestones.length > 0) {
      const completedCount = milestones.filter((m) => m.isCompleted).length;
      progress = Math.round((completedCount / milestones.length) * 100);
    }

    const newGoal: GoalDto = {
      id,
      userId,
      title: dto.title,
      description: dto.description || null,
      category: dto.category || GoalCategory.CAREER_STUDY,
      targetDate: dto.targetDate,
      progressPercentage: progress,
      milestones,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    this.goals.set(id, newGoal);
    return newGoal;
  }

  async update(userId: string, goalId: string, dto: UpdateGoalDto): Promise<GoalDto> {
    const goal = await this.findById(userId, goalId);
    const now = new Date().toISOString();

    if (dto.title !== undefined) goal.title = dto.title;
    if (dto.description !== undefined) goal.description = dto.description;
    if (dto.category !== undefined) goal.category = dto.category;
    if (dto.targetDate !== undefined) goal.targetDate = dto.targetDate;
    if (dto.isArchived !== undefined) goal.isArchived = dto.isArchived;

    if (dto.milestones !== undefined) {
      goal.milestones = dto.milestones.map((m: any, idx: number) => ({
        id: m.id || `ms_${goalId}_${idx + 1}`,
        title: m.title,
        isCompleted: !!m.isCompleted,
        dueDate: m.dueDate || null,
      }));
      if (goal.milestones.length > 0 && dto.progressPercentage === undefined) {
        const completed = goal.milestones.filter((m) => m.isCompleted).length;
        goal.progressPercentage = Math.round((completed / goal.milestones.length) * 100);
      }
    }

    if (dto.progressPercentage !== undefined) {
      goal.progressPercentage = dto.progressPercentage;
    }

    goal.updatedAt = now;
    this.goals.set(goalId, goal);
    return goal;
  }

  async toggleMilestone(
    userId: string,
    goalId: string,
    milestoneId: string,
  ): Promise<GoalDto> {
    const goal = await this.findById(userId, goalId);
    const ms = goal.milestones.find((m) => m.id === milestoneId);
    if (!ms) {
      throw new NotFoundException(`Milestone ${milestoneId} not found`);
    }

    ms.isCompleted = !ms.isCompleted;

    // Recalculate progress percentage
    if (goal.milestones.length > 0) {
      const completedCount = goal.milestones.filter((m) => m.isCompleted).length;
      goal.progressPercentage = Math.round((completedCount / goal.milestones.length) * 100);
    }

    goal.updatedAt = new Date().toISOString();
    this.goals.set(goalId, goal);
    return goal;
  }

  async delete(userId: string, goalId: string): Promise<{ success: boolean; id: string }> {
    await this.findById(userId, goalId);
    this.goals.delete(goalId);
    return { success: true, id: goalId };
  }
}
