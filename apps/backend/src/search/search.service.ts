import { Injectable, Optional } from '@nestjs/common';
import {
  HybridSearchResponseDto,
  SearchEntityType,
  SearchQueryDto,
  SearchResultItemDto,
} from '@lifeos/shared-types';
import { NotesService } from '../notes/notes.service';
import { TaskService } from '../planner/services/task.service';
import { CalendarEngineService } from '../planner/services/calendar-engine.service';
import { ExpensesService } from '../expenses/expenses.service';
import { DocumentsService } from '../documents/documents.service';
import { StudyService } from '../study/services/study.service';
import { EmbeddingService } from '../memory/services/embedding.service';

interface SearchCandidate {
  id: string;
  type: SearchEntityType;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  urlOrRoute: string;
  metadata: Record<string, any>;
  embedding?: number[];
  lexicalScore?: number;
  vectorScore?: number;
  lexicalRank?: number;
  vectorRank?: number;
  rrfScore?: number;
}

@Injectable()
export class SearchService {
  constructor(
    @Optional() private readonly notesService?: NotesService,
    @Optional() private readonly taskService?: TaskService,
    @Optional() private readonly calendarService?: CalendarEngineService,
    @Optional() private readonly expensesService?: ExpensesService,
    @Optional() private readonly documentsService?: DocumentsService,
    @Optional() private readonly studyService?: StudyService,
    @Optional() private readonly embeddingService?: EmbeddingService,
  ) {}

  async hybridSearch(userId: string, dto: SearchQueryDto): Promise<HybridSearchResponseDto> {
    const startTime = Date.now();
    const query = (dto.query || '').trim();
    const targetTypes =
      dto.types && dto.types.length > 0
        ? dto.types
        : [
            SearchEntityType.NOTE,
            SearchEntityType.TASK,
            SearchEntityType.EVENT,
            SearchEntityType.EXPENSE,
            SearchEntityType.DOCUMENT,
            SearchEntityType.FLASHCARD,
          ];

    const kConstant = dto.rrfConstant || 60;
    const limit = dto.limit || 20;
    const offset = dto.offset || 0;
    const minScore = dto.minScore || 0;

    // 1. Gather all candidates across enabled domain modules
    const candidates = await this.gatherCandidates(userId, targetTypes);

    if (candidates.length === 0 || !query) {
      return {
        query,
        totalMatches: candidates.length,
        results: candidates.slice(offset, offset + limit).map((c) => this.toResultItem(c, 0, 0, 0, '')),
        executionTimeMs: Date.now() - startTime,
        appliedTypes: targetTypes,
      };
    }

    // 2. Compute Lexical Scores (Keyword matching & token overlap)
    const queryTokens = query.toLowerCase().split(/[\s,.;:!?_/\-\[\]()]+/).filter(Boolean);
    for (const c of candidates) {
      c.lexicalScore = this.computeLexicalScore(query, queryTokens, c);
    }

    // Rank candidates by lexical score
    const lexicalSorted = [...candidates].sort((a, b) => (b.lexicalScore || 0) - (a.lexicalScore || 0));
    lexicalSorted.forEach((item, index) => {
      item.lexicalRank = index + 1;
    });

    // 3. Compute Vector / Semantic Similarity Scores
    let queryEmbedding: number[] | null = null;
    if (this.embeddingService) {
      queryEmbedding = this.embeddingService.generateEmbedding(query);
    }

    for (const c of candidates) {
      if (this.embeddingService && queryEmbedding) {
        if (!c.embedding) {
          c.embedding = this.embeddingService.generateEmbedding(`${c.title} ${c.content}`);
        }
        c.vectorScore = this.embeddingService.cosineSimilarity(queryEmbedding, c.embedding);
      } else {
        c.vectorScore = c.lexicalScore; // Fallback
      }
    }

    // Rank candidates by vector score
    const vectorSorted = [...candidates].sort((a, b) => (b.vectorScore || 0) - (a.vectorScore || 0));
    vectorSorted.forEach((item, index) => {
      item.vectorRank = index + 1;
    });

    // 4. Compute Reciprocal Rank Fusion (RRF)
    for (const c of candidates) {
      const rrfLex = 1.0 / (kConstant + (c.lexicalRank || 100));
      const rrfVec = 1.2 / (kConstant + (c.vectorRank || 100));
      c.rrfScore = parseFloat((rrfLex + rrfVec).toFixed(6));
    }

    // Filter and sort by RRF Score
    const filtered = candidates
      .filter((c) => {
        const hasLexicalMatch = (c.lexicalScore || 0) > 0.1;
        const hasVectorMatch = (c.vectorScore || 0) >= 0.3;
        const meetsMinScore = (c.rrfScore || 0) >= minScore;
        return meetsMinScore && (hasLexicalMatch || hasVectorMatch);
      })
      .sort((a, b) => (b.rrfScore || 0) - (a.rrfScore || 0));

    const paginated = filtered.slice(offset, offset + limit);
    const results: SearchResultItemDto[] = paginated.map((c) => {
      const snippet = this.generateSnippet(c.content, queryTokens);
      return this.toResultItem(c, c.rrfScore || 0, c.lexicalRank, c.vectorRank, snippet);
    });

    return {
      query,
      totalMatches: filtered.length,
      results,
      executionTimeMs: Date.now() - startTime,
      appliedTypes: targetTypes,
    };
  }

  private async gatherCandidates(userId: string, targetTypes: SearchEntityType[]): Promise<SearchCandidate[]> {
    const candidates: SearchCandidate[] = [];

    // Notes
    if (targetTypes.includes(SearchEntityType.NOTE) && this.notesService) {
      try {
        const notesRes = await this.notesService.findAll(userId, { limit: 100 });
        for (const note of notesRes.items) {
          candidates.push({
            id: note.id,
            type: SearchEntityType.NOTE,
            title: note.title,
            content: note.content,
            tags: note.tags || [],
            createdAt: note.createdAt,
            urlOrRoute: `/notes/${note.id}`,
            metadata: { wikilinks: note.wikilinks },
            embedding: (note as any).embedding,
          });
        }
      } catch {}
    }

    // Tasks
    if (targetTypes.includes(SearchEntityType.TASK) && this.taskService) {
      try {
        const tasks = await this.taskService.findByUser(userId);
        for (const task of tasks) {
          candidates.push({
            id: task.id,
            type: SearchEntityType.TASK,
            title: task.title,
            content: task.description || `${task.title} [Status: ${task.status}]`,
            tags: task.tags || [],
            createdAt: task.createdAt,
            urlOrRoute: `/planner/tasks/${task.id}`,
            metadata: { priority: task.priority, status: task.status, dueDate: task.dueDate },
          });
        }
      } catch {}
    }

    // Calendar Events
    if (targetTypes.includes(SearchEntityType.EVENT) && this.calendarService) {
      try {
        const events = await this.calendarService.findByUser(userId);
        for (const ev of events) {
          candidates.push({
            id: ev.id,
            type: SearchEntityType.EVENT,
            title: ev.title,
            content: `${ev.description || ''} ${ev.location || ''} (Time: ${ev.startTime} - ${ev.endTime})`,
            tags: ['calendar', ev.isGoogleSync ? 'google' : 'local'],
            createdAt: ev.createdAt,
            urlOrRoute: `/planner/calendar/${ev.id}`,
            metadata: { startTime: ev.startTime, endTime: ev.endTime, location: ev.location },
          });
        }
      } catch {}
    }

    // Expenses
    if (targetTypes.includes(SearchEntityType.EXPENSE) && this.expensesService) {
      try {
        const expenses = this.expensesService.getUserExpenses(userId);
        for (const exp of expenses) {
          candidates.push({
            id: exp.id,
            type: SearchEntityType.EXPENSE,
            title: `${exp.merchant}: ${exp.currency} ${exp.amount}`,
            content: `${exp.description || ''} ${exp.ocrRawText || ''} Category: ${exp.category}`,
            tags: ['expense', exp.category.toLowerCase()],
            createdAt: exp.createdAt,
            urlOrRoute: `/expenses/${exp.id}`,
            metadata: { amount: exp.amount, category: exp.category, merchant: exp.merchant },
          });
        }
      } catch {}
    }

    // Documents
    if (targetTypes.includes(SearchEntityType.DOCUMENT) && this.documentsService) {
      try {
        const docs = this.documentsService.getUserDocuments(userId);
        for (const doc of docs) {
          candidates.push({
            id: doc.id,
            type: SearchEntityType.DOCUMENT,
            title: doc.fileName,
            content: `${doc.summary || ''} ${doc.extractedText || ''}`,
            tags: doc.tags || [],
            createdAt: doc.createdAt,
            urlOrRoute: `/documents/${doc.id}`,
            metadata: { mimeType: doc.mimeType, sizeBytes: doc.sizeBytes },
          });
        }
      } catch {}
    }

    // Flashcards & Study Decks
    if (targetTypes.includes(SearchEntityType.FLASHCARD) && this.studyService) {
      try {
        const decks = this.studyService.getUserDecks(userId);
        for (const deck of decks) {
          try {
            const detailed = this.studyService.getDeckById(userId, deck.id);
            for (const card of detailed.cards || []) {
              candidates.push({
                id: card.id,
                type: SearchEntityType.FLASHCARD,
                title: card.question,
                content: `Answer: ${card.answer}. ${card.explanation || ''} Deck: ${deck.title}`,
                tags: deck.tags || ['study', 'flashcard'],
                createdAt: card.createdAt,
                urlOrRoute: `/study/decks/${deck.id}`,
                metadata: { deckId: deck.id, repetitions: card.repetitions, interval: card.interval },
              });
            }
          } catch {}
        }
      } catch {}
    }

    return candidates;
  }

  private computeLexicalScore(query: string, tokens: string[], candidate: SearchCandidate): number {
    const titleLower = candidate.title.toLowerCase();
    const contentLower = candidate.content.toLowerCase();
    const fullText = `${titleLower} ${contentLower}`;

    let score = 0;

    // Exact query match bonus
    const queryLower = query.toLowerCase();
    if (titleLower.includes(queryLower)) {
      score += 2.5;
    } else if (contentLower.includes(queryLower)) {
      score += 1.5;
    }

    // Token frequency & tag matching
    let tokenMatches = 0;
    for (const t of tokens) {
      if (titleLower.includes(t)) {
        score += 1.0;
        tokenMatches++;
      } else if (contentLower.includes(t)) {
        score += 0.5;
        tokenMatches++;
      }
      if (candidate.tags.some((tag) => tag.toLowerCase() === t)) {
        score += 1.2;
      }
    }

    const matchRatio = tokens.length > 0 ? tokenMatches / tokens.length : 0;
    score += matchRatio * 0.8;

    return parseFloat(score.toFixed(4));
  }

  private generateSnippet(content: string, tokens: string[]): string {
    if (!content) return '';
    const cleanContent = content.replace(/[#*`_\[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanContent.length <= 150) return cleanContent;

    const lower = cleanContent.toLowerCase();
    let bestPos = -1;

    for (const t of tokens) {
      const idx = lower.indexOf(t);
      if (idx !== -1 && (bestPos === -1 || idx < bestPos)) {
        bestPos = idx;
      }
    }

    if (bestPos === -1) {
      return cleanContent.substring(0, 140) + '...';
    }

    const start = Math.max(0, bestPos - 30);
    const end = Math.min(cleanContent.length, start + 140);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < cleanContent.length ? '...' : '';

    return `${prefix}${cleanContent.substring(start, end)}${suffix}`;
  }

  private toResultItem(
    c: SearchCandidate,
    score: number,
    lexicalRank?: number,
    vectorRank?: number,
    snippet?: string,
  ): SearchResultItemDto {
    return {
      id: c.id,
      type: c.type,
      title: c.title,
      snippet: snippet || c.content.substring(0, 140),
      score,
      lexicalRank,
      vectorRank,
      rrfScore: c.rrfScore || score,
      createdAt: c.createdAt,
      urlOrRoute: c.urlOrRoute,
      metadata: c.metadata,
    };
  }
}
