import { Injectable, NotFoundException } from '@nestjs/common';
import {
  TaskDto,
  TaskPriority,
  TaskStatus,
  TaskChecklistItem,
} from '@lifeos/shared-types';
import { CreateTaskDto, UpdateTaskDto } from '../dto/planner.dto';
import * as crypto from 'crypto';

@Injectable()
export class TaskService {
  private tasks: Map<string, TaskDto> = new Map();

  constructor() {
    this.seedSampleTasks();
  }

  private seedSampleTasks(): void {
    const defaultUserId = 'user_vit_student_001';
    const sampleTasks: Array<Omit<TaskDto, 'id' | 'createdAt' | 'updatedAt'>> = [
      {
        userId: defaultUserId,
        title: 'Review Operating Systems Virtual Memory Slides',
        description: 'Read Chapter 8 & 9 before tomorrow morning lecture',
        priority: TaskPriority.URGENT_IMPORTANT,
        status: TaskStatus.TODO,
        dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        estimatedDurationMinutes: 45,
        completedAt: null,
        tags: ['study', 'os', 'vit'],
        checklist: [
          { id: 'chk-1', title: 'Page replacement algorithms', isCompleted: true },
          { id: 'chk-2', title: 'TLB miss handling', isCompleted: false },
        ],
      },
      {
        userId: defaultUserId,
        title: 'Submit Software Engineering Phase 4 Architecture Milestone',
        description: 'Ensure all tests pass and documentation is frozen',
        priority: TaskPriority.URGENT_IMPORTANT,
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        estimatedDurationMinutes: 60,
        completedAt: null,
        tags: ['project', 'swe', 'vit'],
        checklist: [
          { id: 'chk-3', title: 'Run Jest backend suite', isCompleted: true },
          { id: 'chk-4', title: 'Review Swagger documentation', isCompleted: true },
        ],
      },
      {
        userId: defaultUserId,
        title: 'Prepare System Design Flashcards',
        description: 'Add CAP theorem and CQRS patterns to study deck',
        priority: TaskPriority.NOT_URGENT_IMPORTANT,
        status: TaskStatus.TODO,
        dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        estimatedDurationMinutes: 30,
        completedAt: null,
        tags: ['study', 'flashcards'],
        checklist: [],
      },
      {
        userId: defaultUserId,
        title: 'Unsubscribe from promotional newsletters',
        description: 'Clean inbox clutter',
        priority: TaskPriority.NOT_URGENT_NOT_IMPORTANT,
        status: TaskStatus.TODO,
        dueDate: null,
        estimatedDurationMinutes: 15,
        completedAt: null,
        tags: ['chores'],
        checklist: [],
      },
    ];

    for (const item of sampleTasks) {
      const id = `task_${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      this.tasks.set(id, {
        ...item,
        id,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  async findByUser(
    userId: string,
    filters?: {
      priority?: TaskPriority;
      status?: TaskStatus;
      tag?: string;
      search?: string;
    },
  ): Promise<TaskDto[]> {
    let result = Array.from(this.tasks.values()).filter(
      (t) => t.userId === userId,
    );

    if (filters?.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }
    if (filters?.status) {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters?.tag) {
      result = result.filter((t) => t.tags.includes(filters.tag!));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)),
      );
    }

    // Sort: Urgent & Important first, then by due date
    const priorityOrder: Record<TaskPriority, number> = {
      [TaskPriority.URGENT_IMPORTANT]: 1,
      [TaskPriority.NOT_URGENT_IMPORTANT]: 2,
      [TaskPriority.URGENT_NOT_IMPORTANT]: 3,
      [TaskPriority.NOT_URGENT_NOT_IMPORTANT]: 4,
    };

    return result.sort((a, b) => {
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });
  }

  async findById(userId: string, taskId: string): Promise<TaskDto> {
    const task = this.tasks.get(taskId);
    if (!task || task.userId !== userId) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return task;
  }

  async create(userId: string, dto: CreateTaskDto): Promise<TaskDto> {
    const id = `task_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const checklist: TaskChecklistItem[] = (dto.checklist || []).map((c, i) => ({
      id: `chk_${id}_${i + 1}`,
      title: c.title,
      isCompleted: !!c.isCompleted,
    }));

    const newTask: TaskDto = {
      id,
      userId,
      title: dto.title,
      description: dto.description || null,
      priority: dto.priority || TaskPriority.NOT_URGENT_IMPORTANT,
      status: dto.status || TaskStatus.TODO,
      dueDate: dto.dueDate || null,
      estimatedDurationMinutes: dto.estimatedDurationMinutes || null,
      completedAt: dto.status === TaskStatus.COMPLETED ? now : null,
      tags: dto.tags || [],
      checklist,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(id, newTask);
    return newTask;
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto): Promise<TaskDto> {
    const task = await this.findById(userId, taskId);
    const now = new Date().toISOString();

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.status !== undefined) {
      task.status = dto.status;
      if (dto.status === TaskStatus.COMPLETED && !task.completedAt) {
        task.completedAt = now;
      } else if (dto.status !== TaskStatus.COMPLETED) {
        task.completedAt = null;
      }
    }
    if (dto.dueDate !== undefined) task.dueDate = dto.dueDate;
    if (dto.estimatedDurationMinutes !== undefined) {
      task.estimatedDurationMinutes = dto.estimatedDurationMinutes;
    }
    if (dto.tags !== undefined) task.tags = dto.tags;
    task.updatedAt = now;

    this.tasks.set(taskId, task);
    return task;
  }

  async toggleChecklistItem(
    userId: string,
    taskId: string,
    checkItemId: string,
  ): Promise<TaskDto> {
    const task = await this.findById(userId, taskId);
    if (!task.checklist) task.checklist = [];

    const item = task.checklist.find((c) => c.id === checkItemId);
    if (!item) {
      throw new NotFoundException(`Checklist item ${checkItemId} not found`);
    }

    item.isCompleted = !item.isCompleted;
    task.updatedAt = new Date().toISOString();
    this.tasks.set(taskId, task);
    return task;
  }

  async delete(userId: string, taskId: string): Promise<{ success: boolean; id: string }> {
    await this.findById(userId, taskId);
    this.tasks.delete(taskId);
    return { success: true, id: taskId };
  }

  async getEisenhowerMatrix(userId: string): Promise<{
    q1DoFirst: TaskDto[];
    q2Schedule: TaskDto[];
    q3Delegate: TaskDto[];
    q4Eliminate: TaskDto[];
  }> {
    const userTasks = await this.findByUser(userId);
    return {
      q1DoFirst: userTasks.filter((t) => t.priority === TaskPriority.URGENT_IMPORTANT && t.status !== TaskStatus.COMPLETED),
      q2Schedule: userTasks.filter((t) => t.priority === TaskPriority.NOT_URGENT_IMPORTANT && t.status !== TaskStatus.COMPLETED),
      q3Delegate: userTasks.filter((t) => t.priority === TaskPriority.URGENT_NOT_IMPORTANT && t.status !== TaskStatus.COMPLETED),
      q4Eliminate: userTasks.filter((t) => t.priority === TaskPriority.NOT_URGENT_NOT_IMPORTANT && t.status !== TaskStatus.COMPLETED),
    };
  }
}
