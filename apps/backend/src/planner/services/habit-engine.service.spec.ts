import { Test, TestingModule } from '@nestjs/testing';
import { HabitEngineService } from './habit-engine.service';
import { NotFoundException } from '@nestjs/common';

describe('HabitEngineService', () => {
  let service: HabitEngineService;
  const mockUserId = 'user_test_habits_123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HabitEngineService],
    }).compile();

    service = module.get<HabitEngineService>(HabitEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a habit and initialize streaks to zero', async () => {
    const habit = await service.create(mockUserId, {
      title: 'Practice LeetCode Daily',
      description: 'Minimum 2 problems',
      frequency: 'DAILY',
      targetDaysPerWeek: 7,
      categoryColor: '#10B981',
    });

    expect(habit).toBeDefined();
    expect(habit.id).toMatch(/^habit_/);
    expect(habit.userId).toBe(mockUserId);
    expect(habit.currentStreak).toBe(0);
    expect(habit.longestStreak).toBe(0);
    expect(habit.totalCompletions).toBe(0);
  });

  it('should toggle habit completion for today and increment streaks', async () => {
    const habit = await service.create(mockUserId, {
      title: 'Read 20 pages',
      frequency: 'DAILY',
    });

    const result = await service.toggleHabitCompletion(mockUserId, habit.id);
    expect(result.completed).toBe(true);
    expect(result.habit.currentStreak).toBe(1);
    expect(result.habit.longestStreak).toBe(1);
    expect(result.habit.totalCompletions).toBe(1);

    // Untoggle
    const untoggleResult = await service.toggleHabitCompletion(mockUserId, habit.id);
    expect(untoggleResult.completed).toBe(false);
    expect(untoggleResult.habit.currentStreak).toBe(0);
    expect(untoggleResult.habit.totalCompletions).toBe(0);
  });

  it('should calculate 30-day completion rate analytics (REQ-PLAN-4)', async () => {
    const habit = await service.create(mockUserId, {
      title: 'Gym Workout',
      frequency: 'DAILY',
    });

    // Log 3 consecutive days
    const d1 = new Date();
    d1.setDate(d1.getDate() - 2);
    const d2 = new Date();
    d2.setDate(d2.getDate() - 1);
    const d3 = new Date();

    await service.toggleHabitCompletion(mockUserId, habit.id, { date: d1.toISOString().split('T')[0] });
    await service.toggleHabitCompletion(mockUserId, habit.id, { date: d2.toISOString().split('T')[0] });
    await service.toggleHabitCompletion(mockUserId, habit.id, { date: d3.toISOString().split('T')[0] });

    const analytics = await service.getAnalytics(mockUserId, habit.id);
    expect(analytics.habitId).toBe(habit.id);
    expect(analytics.totalCompletions).toBe(3);
    expect(analytics.currentStreak).toBe(3);
    expect(analytics.completionRateLast30Days).toBe(10); // 3 / 30 = 10%
  });

  it('should delete a habit and purge associated logs', async () => {
    const habit = await service.create(mockUserId, {
      title: 'To be removed habit',
    });

    await service.toggleHabitCompletion(mockUserId, habit.id);
    const res = await service.delete(mockUserId, habit.id);
    expect(res.success).toBe(true);

    await expect(service.findById(mockUserId, habit.id)).rejects.toThrow(
      NotFoundException,
    );
  });
});
