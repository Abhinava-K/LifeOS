import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from '../planner/services/task.service';
import { CalendarEngineService } from '../planner/services/calendar-engine.service';
import { NotesService } from '../notes/notes.service';
import { ExpensesService } from '../expenses/expenses.service';
import { DocumentsService } from '../documents/documents.service';
import { StudyService } from '../study/services/study.service';
import { Sm2Service } from '../study/services/sm2.service';
import { MemoryService } from '../memory/services/memory.service';
import { EmbeddingService } from '../memory/services/embedding.service';
import { ContextBuilderService } from '../memory/services/context-builder.service';
import { SearchService } from '../search/search.service';
import { GoogleSyncService } from '../google-sync/google-sync.service';
import { UsersService } from '../users/users.service';
import { UserStoreService } from '../users/user-store.service';
import {
  TaskPriority,
  TaskStatus,
  ExpenseCategory,
  MemoryCategory,
  SearchEntityType,
  UserRole,
} from '@lifeos/shared-types';

describe('End-to-End Cross-Subsystem Integration (Phase 6: Task 6.1)', () => {
  let taskService: TaskService;
  let calendarService: CalendarEngineService;
  let notesService: NotesService;
  let expensesService: ExpensesService;
  let docsService: DocumentsService;
  let studyService: StudyService;
  let memoryService: MemoryService;
  let searchService: SearchService;
  let googleSyncService: GoogleSyncService;
  let userStoreService: UserStoreService;
  let usersService: UsersService;
  let testUserId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        CalendarEngineService,
        NotesService,
        ExpensesService,
        DocumentsService,
        StudyService,
        Sm2Service,
        EmbeddingService,
        ContextBuilderService,
        MemoryService,
        GoogleSyncService,
        UserStoreService,
        UsersService,
        {
          provide: SearchService,
          useValue: {
            hybridSearch: jest.fn().mockImplementation((userId, dto) =>
              Promise.resolve({
                query: dto.query,
                totalMatches: 3,
                executionTimeMs: 12,
                results: [
                  {
                    id: 'res-1',
                    type: SearchEntityType.NOTE,
                    title: 'Distributed Systems Architecture',
                    snippet: 'Raft consensus and Paxos replication...',
                    rrfScore: 0.95,
                  },
                  {
                    id: 'res-2',
                    type: SearchEntityType.TASK,
                    title: 'Prepare Final System Verification',
                    snippet: 'Review P95 latency and NFR metrics...',
                    rrfScore: 0.88,
                  },
                ],
              }),
            ),
          },
        },
      ],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
    calendarService = module.get<CalendarEngineService>(CalendarEngineService);
    notesService = module.get<NotesService>(NotesService);
    expensesService = module.get<ExpensesService>(ExpensesService);
    docsService = module.get<DocumentsService>(DocumentsService);
    studyService = module.get<StudyService>(StudyService);
    memoryService = module.get<MemoryService>(MemoryService);
    searchService = module.get<SearchService>(SearchService);
    googleSyncService = module.get<GoogleSyncService>(GoogleSyncService);
    userStoreService = module.get<UserStoreService>(UserStoreService);
    usersService = module.get<UsersService>(UsersService);

    const user = userStoreService.createUser({
      email: 'e2e@lifeos.ai',
      fullName: 'Integration Test Lead',
      passwordHash: 'hash',
      role: UserRole.USER,
    });
    testUserId = user.id;
  });

  it('INTEG-01: User Profile -> Planner Tasks & Calendar Scheduling', async () => {
    const profile = usersService.getCurrentUser(testUserId);
    expect(profile).toBeDefined();

    const createdTask = await taskService.create(testUserId, {
      title: 'Complete Phase 6 End-to-End Verification',
      priority: TaskPriority.URGENT_IMPORTANT,
      status: TaskStatus.TODO,
    });
    expect(createdTask.id).toBeDefined();
    expect(createdTask.priority).toBe(TaskPriority.URGENT_IMPORTANT);

    const event = await calendarService.create(testUserId, {
      title: 'Final Release Gate Review',
      startTime: '2026-11-06T10:00:00Z',
      endTime: '2026-11-06T11:00:00Z',
    });
    expect(event.id).toBeDefined();
  });

  it('INTEG-02: Knowledge Hub -> Notes & Expense OCR Tracking', async () => {
    const note = await notesService.createNote(testUserId, {
      title: 'Phase 6 Integration Checkpoint',
      content: 'All 11 functional modules unified under single modular monolith.',
      tags: ['verification', 'e2e'],
    });
    expect(note.id).toBeDefined();

    const expense = expensesService.createExpense(testUserId, {
      amount: 15.5,
      currency: 'USD',
      category: ExpenseCategory.TECH_SOFTWARE,
      merchant: 'OpenAI API Token Top-up',
      description: 'Inference test tokens',
      date: new Date().toISOString(),
    });
    expect(expense.id).toBeDefined();
    expect(expense.amount).toBe(15.5);
  });

  it('INTEG-03: Study Hub SM-2 -> Document Vault & Flashcard Review', async () => {
    const doc = docsService.uploadDocument(testUserId, {
      fileName: 'LifeOS_System_Verification_Report.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024 * 1024 * 2, // 2MB
      summary: 'Comprehensive NFR testing and P95 performance metrics.',
      tags: ['audit', 'pdf'],
    });
    expect(doc.id).toBeDefined();

    const deck = studyService.createDeck(testUserId, {
      title: 'Phase 6 Verification Deck',
      tags: ['audit'],
    });
    const card = studyService.addCardToDeck(testUserId, deck.id, {
      deckId: deck.id,
      question: 'What is the target P95 latency for non-LLM LifeOS REST APIs?',
      answer: '< 200 ms under standard load.',
      explanation: 'IEEE 830 Non-Functional Requirement NFR-PERF-1.',
    });
    expect(card.id).toBeDefined();

    const reviewed = studyService.reviewCard(testUserId, card.id, 5);
    expect(reviewed.repetitions).toBe(1);
    expect(reviewed.interval).toBe(1);
  });

  it('INTEG-04: Long-Term Memory Recall -> Hybrid Search -> Google Sync', async () => {
    const memory = await memoryService.createMemory(testUserId, {
      content: 'User prefers dark mode and daily productivity briefings at 08:00 AM.',
      category: MemoryCategory.PREFERENCE,
      importance: 9,
    });
    expect(memory.id).toBeDefined();

    const searchRes = await searchService.hybridSearch(testUserId, {
      query: 'Distributed Systems Architecture',
      limit: 10,
    });
    expect(searchRes.results.length).toBeGreaterThan(0);
    expect(searchRes.results[0].rrfScore).toBeGreaterThan(0);

    const syncResult = await googleSyncService.triggerSync('usr_demo_123');
    expect(syncResult.status).toBe('SUCCESS');
    expect(syncResult.syncedItemsCount.calendar).toBeGreaterThanOrEqual(1);
  });
});
