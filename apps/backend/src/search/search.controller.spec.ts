import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { NotesService } from '../notes/notes.service';
import { TaskService } from '../planner/services/task.service';
import { CalendarEngineService } from '../planner/services/calendar-engine.service';
import { ExpensesService } from '../expenses/expenses.service';
import { DocumentsService } from '../documents/documents.service';
import { StudyService } from '../study/services/study.service';
import { Sm2Service } from '../study/services/sm2.service';
import { EmbeddingService } from '../memory/services/embedding.service';

describe('SearchController', () => {
  let controller: SearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        SearchService,
        NotesService,
        TaskService,
        CalendarEngineService,
        ExpensesService,
        DocumentsService,
        StudyService,
        Sm2Service,
        EmbeddingService,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SearchController>(SearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should execute simple search endpoint', async () => {
    const mockReq = { user: { userId: 'usr_demo_123' } } as any;
    const res = await controller.simpleSearch(mockReq, 'Architecture', 'NOTE,DOCUMENT', 10, 0);

    expect(res.success).toBe(true);
    expect(res.data.query).toBe('Architecture');
    expect(res.data.results).toBeDefined();
  });

  it('should execute hybrid search POST endpoint', async () => {
    const mockReq = { user: { userId: 'usr_demo_123' } } as any;
    const res = await controller.hybridSearch(mockReq, {
      query: 'Virtual Memory',
      limit: 5,
    });

    expect(res.success).toBe(true);
    expect(res.data.totalMatches).toBeGreaterThan(0);
  });
});
