import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { NotesService } from '../notes/notes.service';
import { TaskService } from '../planner/services/task.service';
import { CalendarEngineService } from '../planner/services/calendar-engine.service';
import { ExpensesService } from '../expenses/expenses.service';
import { DocumentsService } from '../documents/documents.service';
import { StudyService } from '../study/services/study.service';
import { Sm2Service } from '../study/services/sm2.service';
import { EmbeddingService } from '../memory/services/embedding.service';
import { SearchEntityType } from '@lifeos/shared-types';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should perform hybrid search across notes, tasks and documents with RRF scoring', async () => {
    const res = await service.hybridSearch('usr_demo_123', {
      query: 'Operating Systems',
    });

    expect(res).toBeDefined();
    expect(res.query).toBe('Operating Systems');
    expect(res.totalMatches).toBeGreaterThan(0);
    expect(res.results.length).toBeGreaterThan(0);

    const first = res.results[0];
    expect(first.title).toBeDefined();
    expect(first.snippet).toBeDefined();
    expect(first.rrfScore).toBeGreaterThan(0);
    expect(first.lexicalRank).toBeDefined();
    expect(first.vectorRank).toBeDefined();
  });

  it('should filter search results by entity types', async () => {
    const res = await service.hybridSearch('usr_demo_123', {
      query: 'Architecture',
      types: [SearchEntityType.NOTE],
    });

    expect(res.results.every((r) => r.type === SearchEntityType.NOTE)).toBe(true);
  });

  it('should return empty results gracefully for non-matching nonsense query', async () => {
    const res = await service.hybridSearch('usr_demo_123', {
      query: 'xyzqwerty987654321nonexistentphrase',
    });

    expect(res.totalMatches).toBe(0);
    expect(res.results).toEqual([]);
  });

  it('should paginate results with limit and offset', async () => {
    const res = await service.hybridSearch('usr_demo_123', {
      query: 'System',
      limit: 1,
      offset: 0,
    });

    expect(res.results.length).toBeLessThanOrEqual(1);
  });
});
