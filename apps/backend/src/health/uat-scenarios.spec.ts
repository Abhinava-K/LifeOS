import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from '../planner/services/task.service';
import { CalendarEngineService } from '../planner/services/calendar-engine.service';
import { HabitEngineService } from '../planner/services/habit-engine.service';
import { StudyService } from '../study/services/study.service';
import { Sm2Service } from '../study/services/sm2.service';
import { GoogleSyncService } from '../google-sync/google-sync.service';
import {
  TaskPriority,
  TaskStatus,
} from '@lifeos/shared-types';

describe('User Acceptance Testing (UAT) Scenarios (Phase 6: Task 6.2)', () => {
  let taskService: TaskService;
  let calendarService: CalendarEngineService;
  let habitService: HabitEngineService;
  let studyService: StudyService;
  let googleSyncService: GoogleSyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        CalendarEngineService,
        HabitEngineService,
        StudyService,
        Sm2Service,
        GoogleSyncService,
      ],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
    calendarService = module.get<CalendarEngineService>(CalendarEngineService);
    habitService = module.get<HabitEngineService>(HabitEngineService);
    studyService = module.get<StudyService>(StudyService);
    googleSyncService = module.get<GoogleSyncService>(GoogleSyncService);
  });

  describe('UAT Scenario 1: Daily Productivity User Journey', () => {
    it('executes morning triage, time blocking, and habit logging seamlessly', async () => {
      // 1. User checks schedule and discovers focus blocks
      const freeBlocks = await calendarService.findFreeFocusBlocks('user_vit_student_001', '2026-10-15');
      expect(freeBlocks.length).toBeGreaterThan(0);

      // 2. User creates a Q1 Urgent/Important task
      const task = await taskService.create('user_vit_student_001', {
        title: 'Review System Verification Metrics',
        priority: TaskPriority.URGENT_IMPORTANT,
        status: TaskStatus.TODO,
      });
      expect(task.id).toBeDefined();

      // 3. User checks into a daily habit and toggles completion
      const habit = await habitService.create('user_vit_student_001', {
        title: 'Morning Deep Work Routine',
        frequency: 'DAILY',
        targetDaysPerWeek: 7,
      });
      const checkin = await habitService.toggleHabitCompletion('user_vit_student_001', habit.id);
      expect(checkin.completed).toBe(true);
      expect(checkin.habit.id).toBe(habit.id);
    });
  });

  describe('UAT Scenario 2: Active Student / Spaced Repetition Journey', () => {
    it('creates flashcard set and verifies SM-2 interval progression', async () => {
      // 1. Create a deck and flashcard
      const deck = studyService.createDeck('user_vit_student_001', {
        title: 'Algorithms & Data Structures Deck',
        tags: ['study'],
      });
      const card = studyService.addCardToDeck('user_vit_student_001', deck.id, {
        deckId: deck.id,
        question: 'What is Reciprocal Rank Fusion (RRF)?',
        answer: 'An algorithmic score combination technique: RRF(d) = sum(1 / (k + r_i(d))).',
      });
      expect(card.easeFactor).toBe(2.5);

      // 2. User scores a successful recall (Quality 4)
      const review1 = studyService.reviewCard('user_vit_student_001', card.id, 4);
      expect(review1.interval).toBe(1);
      expect(review1.repetitions).toBe(1);

      // 3. Next repetition progresses to interval 6 days
      const review2 = studyService.reviewCard('user_vit_student_001', card.id, 5);
      expect(review2.interval).toBe(6);
      expect(review2.repetitions).toBe(2);
    });
  });

  describe('UAT Scenario 3: Cloud Synchronization Journey', () => {
    it('executes bi-directional Google Workspace sync and captures audit log', async () => {
      const syncResult = await googleSyncService.triggerSync('usr_demo_123');
      expect(syncResult.status).toBe('SUCCESS');
      expect(syncResult.syncedItemsCount.calendar).toBeGreaterThanOrEqual(1);

      const logs = await googleSyncService.getSyncLogs('usr_demo_123');
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].status).toBe('SUCCESS');
    });
  });
});
