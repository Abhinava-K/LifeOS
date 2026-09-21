import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { TaskPriority, TaskStatus } from '@lifeos/shared-types';
import { NotFoundException } from '@nestjs/common';

describe('TaskService', () => {
  let service: TaskService;
  const mockUserId = 'user_test_planner_123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskService],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a task with Eisenhower priority and checklist', async () => {
    const task = await service.create(mockUserId, {
      title: 'Study Distributed Consensus (Raft & Paxos)',
      description: 'Prepare lecture presentation',
      priority: TaskPriority.URGENT_IMPORTANT,
      status: TaskStatus.TODO,
      estimatedDurationMinutes: 60,
      tags: ['study', 'distributed-systems'],
      checklist: [
        { title: 'Leader election algorithm', isCompleted: false },
        { title: 'Log replication step', isCompleted: false },
      ],
    });

    expect(task).toBeDefined();
    expect(task.id).toMatch(/^task_/);
    expect(task.userId).toBe(mockUserId);
    expect(task.title).toBe('Study Distributed Consensus (Raft & Paxos)');
    expect(task.priority).toBe(TaskPriority.URGENT_IMPORTANT);
    expect(task.checklist?.length).toBe(2);
    expect(task.checklist?.[0].title).toBe('Leader election algorithm');
  });

  it('should find tasks filtered by priority and search keyword', async () => {
    await service.create(mockUserId, {
      title: 'Urgent Task: Fix Auth Middleware',
      priority: TaskPriority.URGENT_IMPORTANT,
      status: TaskStatus.TODO,
    });

    await service.create(mockUserId, {
      title: 'Low Priority: Clean temp files',
      priority: TaskPriority.NOT_URGENT_NOT_IMPORTANT,
      status: TaskStatus.TODO,
    });

    const urgentTasks = await service.findByUser(mockUserId, {
      priority: TaskPriority.URGENT_IMPORTANT,
    });
    expect(urgentTasks.length).toBe(1);
    expect(urgentTasks[0].title).toContain('Fix Auth Middleware');

    const searched = await service.findByUser(mockUserId, {
      search: 'Auth',
    });
    expect(searched.length).toBe(1);
  });

  it('should update task status and automatically set completedAt', async () => {
    const task = await service.create(mockUserId, {
      title: 'Write Unit Tests for Planner',
      priority: TaskPriority.NOT_URGENT_IMPORTANT,
      status: TaskStatus.TODO,
    });

    expect(task.completedAt).toBeNull();

    const updated = await service.update(mockUserId, task.id, {
      status: TaskStatus.COMPLETED,
    });

    expect(updated.status).toBe(TaskStatus.COMPLETED);
    expect(updated.completedAt).toBeDefined();
  });

  it('should toggle checklist items inside a task', async () => {
    const task = await service.create(mockUserId, {
      title: 'Weekly Grocery List',
      checklist: [{ title: 'Apples', isCompleted: false }],
    });

    const itemId = task.checklist![0].id;
    const toggled = await service.toggleChecklistItem(mockUserId, task.id, itemId);

    expect(toggled.checklist![0].isCompleted).toBe(true);

    const untoggled = await service.toggleChecklistItem(mockUserId, task.id, itemId);
    expect(untoggled.checklist![0].isCompleted).toBe(false);
  });

  it('should group tasks into Eisenhower Matrix quadrants', async () => {
    await service.create(mockUserId, {
      title: 'Q1: Server outage fix',
      priority: TaskPriority.URGENT_IMPORTANT,
    });
    await service.create(mockUserId, {
      title: 'Q2: Plan semester goals',
      priority: TaskPriority.NOT_URGENT_IMPORTANT,
    });
    await service.create(mockUserId, {
      title: 'Q3: Answer non-urgent query',
      priority: TaskPriority.URGENT_NOT_IMPORTANT,
    });
    await service.create(mockUserId, {
      title: 'Q4: Browse random social media',
      priority: TaskPriority.NOT_URGENT_NOT_IMPORTANT,
    });

    const matrix = await service.getEisenhowerMatrix(mockUserId);
    expect(matrix.q1DoFirst.length).toBeGreaterThanOrEqual(1);
    expect(matrix.q2Schedule.length).toBeGreaterThanOrEqual(1);
    expect(matrix.q3Delegate.length).toBeGreaterThanOrEqual(1);
    expect(matrix.q4Eliminate.length).toBeGreaterThanOrEqual(1);
  });

  it('should throw NotFoundException when task does not exist or user mismatch', async () => {
    await expect(service.findById(mockUserId, 'invalid_id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete a task', async () => {
    const task = await service.create(mockUserId, {
      title: 'Task to be deleted',
    });

    const res = await service.delete(mockUserId, task.id);
    expect(res.success).toBe(true);
    await expect(service.findById(mockUserId, task.id)).rejects.toThrow(
      NotFoundException,
    );
  });
});
