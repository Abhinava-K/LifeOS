import { Test, TestingModule } from '@nestjs/testing';
import { PlannerController } from './planner.controller';
import { TaskService } from './services/task.service';
import { CalendarEngineService } from './services/calendar-engine.service';
import { HabitEngineService } from './services/habit-engine.service';
import { GoalService } from './services/goal.service';
import { NotificationSchedulerService } from './services/notification-scheduler.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaskPriority, TaskStatus, GoalCategory } from '@lifeos/shared-types';

describe('PlannerController', () => {
  let controller: PlannerController;
  const mockUser = { userId: 'user_controller_test_123', email: 'test@vit.ac.in' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlannerController],
      providers: [
        TaskService,
        CalendarEngineService,
        HabitEngineService,
        GoalService,
        NotificationSchedulerService,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PlannerController>(PlannerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a comprehensive daily briefing', async () => {
    const req = { user: mockUser };
    const res = await controller.getDailyBriefing(req);

    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data.greeting).toBeDefined();
    expect(res.data.scheduledEvents).toBeInstanceOf(Array);
    expect(res.data.topTasks).toBeInstanceOf(Array);
    expect(res.data.habitSummary).toBeDefined();
  });

  it('should create and fetch tasks via REST controller', async () => {
    const req = { user: mockUser };
    const createRes = await controller.createTask(req, {
      title: 'REST Endpoint Verification Task',
      priority: TaskPriority.URGENT_IMPORTANT,
      status: TaskStatus.TODO,
    });

    expect(createRes.success).toBe(true);
    expect(createRes.data.title).toBe('REST Endpoint Verification Task');

    const listRes = await controller.getTasks(req);
    expect(listRes.success).toBe(true);
    expect(listRes.data.some((t: any) => t.title === 'REST Endpoint Verification Task')).toBe(true);
  });

  it('should return Eisenhower Matrix grouping', async () => {
    const req = { user: mockUser };
    const res = await controller.getEisenhowerMatrix(req);

    expect(res.success).toBe(true);
    expect(res.data.q1DoFirst).toBeDefined();
    expect(res.data.q2Schedule).toBeDefined();
    expect(res.data.q3Delegate).toBeDefined();
    expect(res.data.q4Eliminate).toBeDefined();
  });

  it('should detect calendar conflicts via controller endpoint', async () => {
    const req = { user: mockUser };

    // Create an event
    await controller.createEvent(req, {
      title: 'Midterm Evaluation',
      startTime: '2026-09-20T10:00:00.000Z',
      endTime: '2026-09-20T12:00:00.000Z',
    });

    const conflictRes = await controller.checkConflicts(
      req,
      '2026-09-20T11:00:00.000Z',
      '2026-09-20T13:00:00.000Z',
    );

    expect(conflictRes.success).toBe(true);
    expect(conflictRes.data.hasConflict).toBe(true);
    expect(conflictRes.data.overlapMinutes).toBe(60);
  });

  it('should create and toggle goals and milestones', async () => {
    const req = { user: mockUser };

    const goalRes = await controller.createGoal(req, {
      title: 'Publish IEEE Conference Paper',
      category: GoalCategory.CAREER_STUDY,
      targetDate: '2026-11-01T00:00:00.000Z',
      milestones: [
        { title: 'Write Literature Survey', isCompleted: false },
        { title: 'Run Benchmark Experiments', isCompleted: false },
      ],
    });

    expect(goalRes.success).toBe(true);
    expect(goalRes.data.progressPercentage).toBe(0);

    const msId = goalRes.data.milestones[0].id;
    const toggleRes = await controller.toggleMilestone(req, goalRes.data.id, msId);

    expect(toggleRes.success).toBe(true);
    expect(toggleRes.data.progressPercentage).toBe(50); // 1 of 2 completed
  });
});
