import { ContextBuilderService } from './context-builder.service';
import { MemoryCategory, RecalledMemoryItemDto } from '@lifeos/shared-types';

describe('ContextBuilderService', () => {
  let service: ContextBuilderService;

  beforeEach(() => {
    service = new ContextBuilderService();
  });

  it('should format empty memory array to empty string', () => {
    const formatted = service.formatMemoriesForPrompt([]);
    expect(formatted).toBe('');
  });

  it('should format memories into XML-structured context section', () => {
    const mockMemories: RecalledMemoryItemDto[] = [
      {
        id: 'm1',
        userId: 'u1',
        category: MemoryCategory.GOAL,
        content: 'Aiming for 9.5+ GPA in VIT Semester 5',
        importance: 10,
        accessCount: 5,
        lastAccessedAt: new Date().toISOString(),
        tags: ['academic', 'vit'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        similarityScore: 0.85,
        recencyScore: 0.95,
        combinedScore: 0.9,
      },
    ];

    const formatted = service.formatMemoriesForPrompt(mockMemories);
    expect(formatted).toContain('<user_long_term_memory>');
    expect(formatted).toContain('Aiming for 9.5+ GPA in VIT Semester 5');
    expect(formatted).toContain('[academic, vit]');
    expect(formatted).toContain('</user_long_term_memory>');
  });

  it('should enrich base prompt with memory context', () => {
    const enriched = service.enrichPromptWithMemory(
      'Schedule my study plan for this evening.',
      '<user_long_term_memory>- Focus on algorithms</user_long_term_memory>',
    );

    expect(enriched).toContain('<user_long_term_memory>');
    expect(enriched).toContain('Schedule my study plan for this evening.');
  });
});
