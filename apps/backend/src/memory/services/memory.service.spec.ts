import { Test, TestingModule } from '@nestjs/testing';
import { MemoryService } from './memory.service';
import { EmbeddingService } from './embedding.service';
import { ContextBuilderService } from './context-builder.service';
import { MemoryCategory } from '@lifeos/shared-types';

describe('MemoryService', () => {
  let service: MemoryService;
  let embeddingService: EmbeddingService;
  let contextBuilder: ContextBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemoryService, EmbeddingService, ContextBuilderService],
    }).compile();

    service = module.get<MemoryService>(MemoryService);
    embeddingService = module.get<EmbeddingService>(EmbeddingService);
    contextBuilder = module.get<ContextBuilderService>(ContextBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(embeddingService).toBeDefined();
    expect(contextBuilder).toBeDefined();
  });

  it('should have initial seeded memories for demo user', async () => {
    const result = await service.getMemories('usr_demo_123');
    expect(result.total).toBeGreaterThanOrEqual(4);
    expect(result.items.some((m) => m.category === MemoryCategory.GOAL)).toBe(true);
  });

  it('should create a memory with 768-dim embedding', async () => {
    const memory = await service.createMemory('usr_test', {
      category: MemoryCategory.PREFERENCE,
      content: 'Likes reviewing algorithms using spaced repetition flashcards.',
      importance: 9,
      tags: ['study', 'sm2', 'flashcards'],
    });

    expect(memory.id).toBeDefined();
    expect(memory.embedding).toBeDefined();
    expect(memory.embedding?.length).toBe(768);
    expect(memory.importance).toBe(9);
    expect(memory.category).toBe(MemoryCategory.PREFERENCE);
  });

  it('should recall relevant memories based on semantic and keyword similarity', async () => {
    await service.createMemory('usr_recall_test', {
      category: MemoryCategory.GOAL,
      content: 'Wants to score highest marks in Computer Networks and Operating Systems.',
      importance: 10,
      tags: ['os', 'networks', 'exam'],
    });

    await service.createMemory('usr_recall_test', {
      category: MemoryCategory.PREFERENCE,
      content: 'Prefers tea over coffee when coding late at night.',
      importance: 4,
      tags: ['tea', 'beverage'],
    });

    const recall = await service.recallMemories('usr_recall_test', {
      query: 'Operating Systems exam preparation notes',
      limit: 2,
    });

    expect(recall.totalFound).toBeGreaterThanOrEqual(1);
    expect(recall.memories[0].content).toContain('Operating Systems');
    expect(recall.formattedContext).toContain('<user_long_term_memory>');
    expect(recall.memories[0].combinedScore).toBeGreaterThan(0);
  });

  it('should compute memory storage statistics', async () => {
    const stats = await service.getStats('usr_demo_123');
    expect(stats.totalMemories).toBeGreaterThan(0);
    expect(stats.avgImportance).toBeGreaterThan(0);
    expect(stats.categoryBreakdown).toBeDefined();
  });

  it('should delete a memory item', async () => {
    const created = await service.createMemory('usr_del_test', {
      content: 'Temporary memory note to delete',
      importance: 2,
    });

    const deleted = await service.deleteMemory('usr_del_test', created.id);
    expect(deleted).toBe(true);

    await expect(service.getMemoryById('usr_del_test', created.id)).rejects.toThrow();
  });
});
