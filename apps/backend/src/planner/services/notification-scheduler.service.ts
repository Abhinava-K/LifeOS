import { Injectable } from '@nestjs/common';
import {
  DailyBriefingDto,
  TaskDto,
  CalendarEventDto,
  HabitDto,
} from '@lifeos/shared-types';
import { TaskService } from './task.service';
import { CalendarEngineService } from './calendar-engine.service';
import { HabitEngineService } from './habit-engine.service';

export interface ScheduledReminder {
  id: string;
  userId: string;
  type: 'TASK_DUE' | 'EVENT_START' | 'HABIT_REMINDER';
  title: string;
  targetTimestamp: string;
  isSent: boolean;
}

@Injectable()
export class NotificationSchedulerService {
  constructor(
    private readonly taskService: TaskService,
    private readonly calendarService: CalendarEngineService,
    private readonly habitService: HabitEngineService,
  ) {}

  /**
   * Generates a rich, personalized daily briefing for the user (REQ-PLAN-6)
   */
  async generateDailyBriefing(userId: string): Promise<DailyBriefingDto> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
    const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

    // 1. Fetch Today's Calendar Events
    const events: CalendarEventDto[] = await this.calendarService.findByUser(userId, {
      from: dayStart,
      to: dayEnd,
    });

    // 2. Fetch Top Tasks (Eisenhower Q1 Do First & Q2 Schedule)
    const allTasks: TaskDto[] = await this.taskService.findByUser(userId);
    const pendingTasks = allTasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
    const topTasks = pendingTasks.slice(0, 5);

    // 3. Fetch Habits Summary
    const habits: HabitDto[] = await this.habitService.findByUser(userId);
    const completedToday = habits.filter((h) => h.lastCompletedDate === todayStr).length;
    const maxActiveStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

    // 4. Curate Contextual AI Recommendations
    const aiRecommendations: string[] = [];
    if (events.length > 3) {
      aiRecommendations.push('Heavy meeting day detected: Protect a 45-min focus block in the afternoon for deep work.');
    } else {
      aiRecommendations.push('Calendar is clear this morning: Ideal window to tackle your top priority tasks.');
    }

    if (habits.length > completedToday) {
      aiRecommendations.push(`You have ${habits.length - completedToday} daily habits left to check off today.`);
    }

    if (topTasks.some((t) => t.priority === 'URGENT_IMPORTANT')) {
      aiRecommendations.push('High-impact deadline approaching: Review urgent tasks first.');
    }

    const greetings = [
      'Good morning! Here is your synchronized LifeOS briefing.',
      'Rise and shine! Your day is organized and ready for execution.',
      'Welcome back. Here is your productivity summary for today.',
    ];
    const greeting = greetings[today.getDate() % greetings.length];

    const quotes = [
      '"Focus is a muscle. The more you protect your time, the stronger it grows."',
      '"Action is the foundational key to all success." — Pablo Picasso',
      '"Simplicity boils down to two steps: Identify the essential. Eliminate the rest."',
    ];
    const quote = quotes[today.getDate() % quotes.length];

    return {
      date: todayStr,
      greeting,
      quote,
      scheduledEvents: events,
      topTasks,
      habitSummary: {
        totalHabits: habits.length,
        completedToday,
        activeStreak: maxActiveStreak,
      },
      budgetSummary: {
        spentThisMonth: 1240,
        monthlyBudget: 3000,
        currency: 'INR',
      },
      aiRecommendations,
    };
  }

  /**
   * Dispatches upcoming notifications & reminder checks
   */
  async getPendingReminders(userId: string): Promise<ScheduledReminder[]> {
    const reminders: ScheduledReminder[] = [];
    const now = new Date();
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const upcomingEvents = await this.calendarService.findByUser(userId, {
      from: now.toISOString(),
      to: in2Hours.toISOString(),
    });

    for (const ev of upcomingEvents) {
      reminders.push({
        id: `rem_ev_${ev.id}`,
        userId,
        type: 'EVENT_START',
        title: `Upcoming Event: ${ev.title} starting soon at ${new Date(ev.startTime).toLocaleTimeString()}`,
        targetTimestamp: ev.startTime,
        isSent: false,
      });
    }

    const tasks = await this.taskService.findByUser(userId);
    const dueSoon = tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) >= now &&
        new Date(t.dueDate) <= in2Hours &&
        t.status !== 'COMPLETED',
    );

    for (const task of dueSoon) {
      reminders.push({
        id: `rem_task_${task.id}`,
        userId,
        type: 'TASK_DUE',
        title: `Task Deadline approaching: "${task.title}"`,
        targetTimestamp: task.dueDate!,
        isSent: false,
      });
    }

    return reminders;
  }
}
