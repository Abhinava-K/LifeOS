import { Injectable, NotFoundException } from '@nestjs/common';
import {
  HabitDto,
  HabitLogDto,
  HabitAnalyticsDto,
} from '@lifeos/shared-types';
import { CreateHabitDto, UpdateHabitDto, HabitLogActionDto } from '../dto/planner.dto';
import * as crypto from 'crypto';

@Injectable()
export class HabitEngineService {
  private habits: Map<string, HabitDto> = new Map();
  private habitLogs: Map<string, HabitLogDto> = new Map();

  constructor() {
    this.seedSampleHabits();
  }

  private seedSampleHabits(): void {
    const defaultUserId = 'user_vit_student_001';
    const sampleHabits: Array<Omit<HabitDto, 'id' | 'createdAt' | 'updatedAt'>> = [
      {
        userId: defaultUserId,
        title: 'Daily LeetCode Problem Solving',
        description: 'Solve at least 2 medium problems on graph or DP',
        frequency: 'DAILY',
        targetDaysPerWeek: 7,
        currentStreak: 12,
        longestStreak: 21,
        totalCompletions: 34,
        lastCompletedDate: this.getYesterdayDateString(),
        categoryColor: '#10B981',
      },
      {
        userId: defaultUserId,
        title: 'Read Research Papers / System Architecture Notes',
        description: 'Read 20 pages of distributed systems literature',
        frequency: 'DAILY',
        targetDaysPerWeek: 5,
        currentStreak: 5,
        longestStreak: 14,
        totalCompletions: 22,
        lastCompletedDate: this.getYesterdayDateString(),
        categoryColor: '#8B5CF6',
      },
      {
        userId: defaultUserId,
        title: 'Morning Gym Workout / Cardio',
        description: '45 minutes physical conditioning',
        frequency: 'DAILY',
        targetDaysPerWeek: 6,
        currentStreak: 8,
        longestStreak: 15,
        totalCompletions: 29,
        lastCompletedDate: this.getYesterdayDateString(),
        categoryColor: '#F59E0B',
      },
    ];

    for (const h of sampleHabits) {
      const id = `habit_${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      this.habits.set(id, {
        ...h,
        id,
        createdAt: now,
        updatedAt: now,
      });

      // Seed historical logs for the last 5 days
      for (let i = 1; i <= 5; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const logId = `log_${crypto.randomUUID()}`;
        this.habitLogs.set(logId, {
          id: logId,
          habitId: id,
          userId: defaultUserId,
          completedDate: dateStr,
          notes: 'Completed daily target',
          createdAt: d.toISOString(),
        });
      }
    }
  }

  private getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getYesterdayDateString(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  async findByUser(userId: string): Promise<HabitDto[]> {
    return Array.from(this.habits.values())
      .filter((h) => h.userId === userId)
      .sort((a, b) => b.currentStreak - a.currentStreak);
  }

  async findById(userId: string, habitId: string): Promise<HabitDto> {
    const habit = this.habits.get(habitId);
    if (!habit || habit.userId !== userId) {
      throw new NotFoundException(`Habit with ID ${habitId} not found`);
    }
    return habit;
  }

  async create(userId: string, dto: CreateHabitDto): Promise<HabitDto> {
    const id = `habit_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const newHabit: HabitDto = {
      id,
      userId,
      title: dto.title,
      description: dto.description || null,
      frequency: dto.frequency || 'DAILY',
      targetDaysPerWeek: dto.targetDaysPerWeek || 7,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      lastCompletedDate: null,
      categoryColor: dto.categoryColor || '#10B981',
      createdAt: now,
      updatedAt: now,
    };

    this.habits.set(id, newHabit);
    return newHabit;
  }

  async update(userId: string, habitId: string, dto: UpdateHabitDto): Promise<HabitDto> {
    const habit = await this.findById(userId, habitId);
    const now = new Date().toISOString();

    if (dto.title !== undefined) habit.title = dto.title;
    if (dto.description !== undefined) habit.description = dto.description;
    if (dto.frequency !== undefined) habit.frequency = dto.frequency;
    if (dto.targetDaysPerWeek !== undefined) habit.targetDaysPerWeek = dto.targetDaysPerWeek;
    if (dto.categoryColor !== undefined) habit.categoryColor = dto.categoryColor;
    habit.updatedAt = now;

    this.habits.set(habitId, habit);
    return habit;
  }

  async delete(userId: string, habitId: string): Promise<{ success: boolean; id: string }> {
    await this.findById(userId, habitId);
    this.habits.delete(habitId);

    // Clean up logs
    for (const [logId, log] of this.habitLogs.entries()) {
      if (log.habitId === habitId) {
        this.habitLogs.delete(logId);
      }
    }
    return { success: true, id: habitId };
  }

  /**
   * Toggle completion for a specific date (defaults to today)
   */
  async toggleHabitCompletion(
    userId: string,
    habitId: string,
    dto?: HabitLogActionDto,
  ): Promise<{ habit: HabitDto; log: HabitLogDto | null; completed: boolean }> {
    const habit = await this.findById(userId, habitId);
    const targetDate = dto?.date || this.getTodayDateString();

    const existingLog = Array.from(this.habitLogs.values()).find(
      (l) => l.habitId === habitId && l.userId === userId && l.completedDate === targetDate,
    );

    if (existingLog) {
      // Untoggle: Remove log and recalculate streaks
      this.habitLogs.delete(existingLog.id);
      await this.recalculateStreaks(habit);
      return { habit, log: null, completed: false };
    } else {
      // Toggle: Add log and recalculate streaks
      const logId = `log_${crypto.randomUUID()}`;
      const newLog: HabitLogDto = {
        id: logId,
        habitId,
        userId,
        completedDate: targetDate,
        notes: dto?.notes || null,
        createdAt: new Date().toISOString(),
      };
      this.habitLogs.set(logId, newLog);
      await this.recalculateStreaks(habit);
      return { habit, log: newLog, completed: true };
    }
  }

  private async recalculateStreaks(habit: HabitDto): Promise<void> {
    const logs = Array.from(this.habitLogs.values())
      .filter((l) => l.habitId === habit.id)
      .sort((a, b) => b.completedDate.localeCompare(a.completedDate));

    habit.totalCompletions = logs.length;
    habit.lastCompletedDate = logs.length > 0 ? logs[0].completedDate : null;

    if (logs.length === 0) {
      habit.currentStreak = 0;
      habit.longestStreak = 0;
      this.habits.set(habit.id, habit);
      return;
    }

    const uniqueDates = Array.from(new Set(logs.map((l) => l.completedDate))).sort(
      (a, b) => b.localeCompare(a),
    );

    const today = this.getTodayDateString();
    const yesterday = this.getYesterdayDateString();

    // Streak is active if completed today or yesterday
    let currentStreak = 0;
    if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
      let checkDate = uniqueDates.includes(today) ? new Date(today) : new Date(yesterday);
      for (const dStr of uniqueDates) {
        const expected = checkDate.toISOString().split('T')[0];
        if (dStr === expected) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (dStr < expected) {
          break;
        }
      }
    }

    habit.currentStreak = currentStreak;
    habit.longestStreak = Math.max(habit.longestStreak, currentStreak);
    habit.updatedAt = new Date().toISOString();
    this.habits.set(habit.id, habit);
  }

  async getAnalytics(userId: string, habitId: string): Promise<HabitAnalyticsDto> {
    const habit = await this.findById(userId, habitId);
    const logs = Array.from(this.habitLogs.values())
      .filter((l) => l.habitId === habitId && l.userId === userId)
      .map((l) => l.completedDate);

    // Calculate completions in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoff = thirtyDaysAgo.toISOString().split('T')[0];

    const last30DaysCount = logs.filter((d) => d >= cutoff).length;
    const rate = Math.min(100, Math.round((last30DaysCount / 30) * 100));

    return {
      habitId: habit.id,
      title: habit.title,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      completionRateLast30Days: rate,
      totalCompletions: habit.totalCompletions,
      recentLogs: logs.slice(0, 10),
    };
  }
}
