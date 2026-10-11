import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateMemoryDto,
  MemoryCategory,
  MemoryItemDto,
  MemoryRecallResultDto,
  MemoryStatsDto,
  RecallMemoryDto,
  RecalledMemoryItemDto,
} from '@lifeos/shared-types';
import { EmbeddingService } from './embedding.service';
import { ContextBuilderService } from './context-builder.service';

@Injectable()
export class MemoryService {
  private memoryStore: Map<string, MemoryItemDto> = new Map();

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly contextBuilder: ContextBuilderService,
  ) {
    this.seedInitialMemories();
  }

  private seedInitialMemories() {
    const defaultUserId = 'usr_demo_123';
    const seeds: Array<Omit<MemoryItemDto, 'id' | 'embedding' | 'createdAt' | 'updatedAt' | 'lastAccessedAt' | 'accessCount'>> = [
      {
        userId: defaultUserId,
        category: MemoryCategory.GOAL,
        content: 'Aiming for a 9.5+ GPA in VIT Semester 5 and completing the LifeOS platform before November 06.',
        importance: 10,
        tags: ['academic', 'vit', 'gpa', 'goals', 'lifeos'],
        metadata: { horizon: 'short_term', targetDate: '2026-11-06' },
      },
      {
        userId: defaultUserId,
        category: MemoryCategory.PREFERENCE,
        content: 'Prefers deep-work study sessions in the early morning between 06:00 AM and 09:30 AM with dark mode enabled.',
        importance: 8,
        tags: ['focus', 'morning', 'routine', 'theme'],
        metadata: { timeWindow: '06:00-09:30' },
      },
      {
        userId: defaultUserId,
        category: MemoryCategory.FACT,
        content: 'Primary programming languages are TypeScript (NestJS, React Native) and Python (CrewAI, FastAPI).',
        importance: 9,
        tags: ['skills', 'typescript', 'python', 'crewai', 'nestjs'],
        metadata: { domain: 'software_engineering' },
      },
      {
        userId: defaultUserId,
        category: MemoryCategory.EPISODIC,
        content: 'Successfully verified and completed Phase 4 domain subsystems (Planner, Notes, Expenses, Study Hub) on October 09.',
        importance: 7,
        tags: ['milestone', 'phase4', 'swe_project'],
        metadata: { milestoneDate: '2026-10-09' },
      },
      {
        userId: defaultUserId,
        category: MemoryCategory.PREFERENCE,
        content: 'Strict monthly budget ceiling of $500 for food and transit expenses.',
        importance: 7,
        tags: ['finance', 'budget', 'expenses'],
        metadata: { monthlyLimit: 500, currency: 'USD' },
      },
    ];

    seeds.forEach((seed, index) => {
      const id = `mem-seed-00${index + 1}`;
      const now = new Date(Date.now() - index * 86400000).toISOString();
      const embedding = this.embeddingService.generateEmbedding(seed.content);
      this.memoryStore.set(id, {
        ...seed,
        id,
        embedding,
        accessCount: 2 + index,
        lastAccessedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  async createMemory(userId: string, dto: CreateMemoryDto): Promise<MemoryItemDto> {
    const id = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const category = dto.category || MemoryCategory.FACT;
    const importance = Math.min(10, Math.max(1, dto.importance ?? 5));
    const tags = dto.tags || [];
    const embedding = this.embeddingService.generateEmbedding(dto.content);

    const memory: MemoryItemDto = {
      id,
      userId,
      category,
      content: dto.content.trim(),
      importance,
      accessCount: 1,
      lastAccessedAt: now,
      embedding,
      tags,
      metadata: dto.metadata || {},
      createdAt: now,
      updatedAt: now,
    };

    this.memoryStore.set(id, memory);
    return memory;
  }

  async getMemories(
    userId: string,
    filters?: {
      category?: MemoryCategory;
      search?: string;
      minImportance?: number;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ items: MemoryItemDto[]; total: number }> {
    let items = Array.from(this.memoryStore.values()).filter((m) => m.userId === userId);

    if (filters?.category) {
      items = items.filter((m) => m.category === filters.category);
    }

    if (filters?.minImportance) {
      items = items.filter((m) => m.importance >= filters.minImportance);
    }

    if (filters?.search) {
      const query = filters.search.toLowerCase();
      items = items.filter(
        (m) =>
          m.content.toLowerCase().includes(query) ||
          m.tags.some((t) => t.toLowerCase().includes(query)),
      );
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = items.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    const paginated = items.slice(offset, offset + limit);

    return { items: paginated, total };
  }

  async getMemoryById(userId: string, id: string): Promise<MemoryItemDto> {
    const memory = this.memoryStore.get(id);
    if (!memory || memory.userId !== userId) {
      throw new NotFoundException(`Memory with ID ${id} not found.`);
    }
    return memory;
  }

  async updateMemory(
    userId: string,
    id: string,
    update: Partial<CreateMemoryDto>,
  ): Promise<MemoryItemDto> {
    const memory = await this.getMemoryById(userId, id);
    const now = new Date().toISOString();

    let embedding = memory.embedding;
    if (update.content && update.content !== memory.content) {
      embedding = this.embeddingService.generateEmbedding(update.content);
    }

    const updated: MemoryItemDto = {
      ...memory,
      content: update.content?.trim() ?? memory.content,
      category: update.category ?? memory.category,
      importance: update.importance !== undefined ? update.importance : memory.importance,
      tags: update.tags ?? memory.tags,
      metadata: update.metadata ? { ...memory.metadata, ...update.metadata } : memory.metadata,
      embedding,
      updatedAt: now,
    };

    this.memoryStore.set(id, updated);
    return updated;
  }

  async deleteMemory(userId: string, id: string): Promise<boolean> {
    const memory = await this.getMemoryById(userId, id);
    return this.memoryStore.delete(memory.id);
  }

  async recallMemories(userId: string, dto: RecallMemoryDto): Promise<MemoryRecallResultDto> {
    const query = dto.query;
    const limit = dto.limit ?? 5;
    const minImportance = dto.minImportance ?? 1;
    const queryEmbedding = this.embeddingService.generateEmbedding(query);
    const now = Date.now();

    const candidates = Array.from(this.memoryStore.values()).filter(
      (m) => m.userId === userId && m.importance >= minImportance,
    );

    const filtered = dto.categories?.length
      ? candidates.filter((m) => dto.categories.includes(m.category))
      : candidates;

    const scored: RecalledMemoryItemDto[] = filtered.map((m) => {
      const similarityScore = m.embedding
        ? this.embeddingService.cosineSimilarity(queryEmbedding, m.embedding)
        : 0;

      // Recency decay: half-life ~ 14 days
      const lastAccessedTime = new Date(m.lastAccessedAt || m.createdAt).getTime();
      const ageInDays = Math.max(0, (now - lastAccessedTime) / (1000 * 60 * 60 * 24));
      const recencyScore = parseFloat(Math.exp(-0.05 * ageInDays).toFixed(4));

      const importanceScore = m.importance / 10;

      // Keyword match bonus
      const lowerQuery = query.toLowerCase();
      let keywordBonus = 0;
      if (m.tags.some((t) => lowerQuery.includes(t.toLowerCase()))) {
        keywordBonus += 0.15;
      }
      if (m.content.toLowerCase().includes(lowerQuery)) {
        keywordBonus += 0.2;
      }

      const combinedScore = parseFloat(
        (0.5 * similarityScore + 0.25 * importanceScore + 0.15 * recencyScore + keywordBonus).toFixed(4),
      );

      return {
        ...m,
        similarityScore,
        recencyScore,
        combinedScore,
      };
    });

    // Sort descending by combinedScore
    scored.sort((a, b) => b.combinedScore - a.combinedScore);
    const topMemories = scored.slice(0, limit);

    // Update access statistics for recalled memories
    const isoNow = new Date().toISOString();
    for (const rec of topMemories) {
      const stored = this.memoryStore.get(rec.id);
      if (stored) {
        stored.accessCount += 1;
        stored.lastAccessedAt = isoNow;
        this.memoryStore.set(stored.id, stored);
      }
    }

    const formattedContext = this.contextBuilder.formatMemoriesForPrompt(topMemories);

    return {
      query,
      totalFound: topMemories.length,
      memories: topMemories,
      formattedContext,
    };
  }

  async getStats(userId: string): Promise<MemoryStatsDto> {
    const userMemories = Array.from(this.memoryStore.values()).filter((m) => m.userId === userId);
    const totalMemories = userMemories.length;

    const categoryBreakdown: Record<string, number> = {};
    let importanceSum = 0;

    userMemories.forEach((m) => {
      categoryBreakdown[m.category] = (categoryBreakdown[m.category] || 0) + 1;
      importanceSum += m.importance;
    });

    const avgImportance = totalMemories > 0 ? parseFloat((importanceSum / totalMemories).toFixed(2)) : 0;

    const mostAccessedMemories = [...userMemories]
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 5);

    return {
      totalMemories,
      categoryBreakdown,
      avgImportance,
      mostAccessedMemories,
    };
  }
}
