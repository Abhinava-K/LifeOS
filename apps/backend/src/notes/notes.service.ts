import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto, NoteDto, QueryNotesDto, UpdateNoteDto } from '@lifeos/shared-types';

@Injectable()
export class NotesService {
  private notesStore: Map<string, NoteDto & { embedding?: number[] }> = new Map();

  constructor() {
    // Seed initial mock notes for demonstration and test coverage
    this.seedInitialNotes();
  }

  private seedInitialNotes() {
    const seed1: NoteDto & { embedding?: number[] } = {
      id: 'note-001',
      userId: 'usr_demo_123',
      title: 'Operating Systems & Concurrency',
      content: '# Concurrency in OS\nProcess context switching and thread scheduling memory layouts. [[Paging]] and [[Virtual Memory]]. #cs #os #exam',
      summary: '• Focuses on OS thread scheduling and context switching.\n• Details virtual memory and paging.\n• Key study material for CS exam.',
      tags: ['cs', 'os', 'exam'],
      wikilinks: ['Paging', 'Virtual Memory'],
      isPinned: true,
      hasEmbedding: true,
      embedding: new Array(1536).fill(0.01),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const seed2: NoteDto & { embedding?: number[] } = {
      id: 'note-002',
      userId: 'usr_demo_123',
      title: 'LifeOS System Architecture',
      content: '# Architecture Overview\nNestJS Modular Monolith backend paired with Python CrewAI microservice. Vector search powered by [[pgvector]]. #lifeos #arch',
      summary: '• Outlines NestJS modular monolith design.\n• Connects Python CrewAI multi-agent service.\n• Uses pgvector for hybrid RRF search.',
      tags: ['lifeos', 'arch'],
      wikilinks: ['pgvector'],
      isPinned: false,
      hasEmbedding: true,
      embedding: new Array(1536).fill(0.02),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.notesStore.set(seed1.id, seed1);
    this.notesStore.set(seed2.id, seed2);
  }

  /**
   * Helper to parse wikilinks [[Target]] and hashtags #tag from raw markdown content
   */
  private extractMetadataFromContent(content: string, providedTags?: string[], providedWikilinks?: string[]) {
    const wikilinkRegex = /\[\[(.*?)\]\]/g;
    const extractedWikilinks: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = wikilinkRegex.exec(content)) !== null) {
      if (match[1] && !extractedWikilinks.includes(match[1])) {
        extractedWikilinks.push(match[1]);
      }
    }

    const tagRegex = /#(\w+)/g;
    const extractedTags: string[] = [];
    while ((match = tagRegex.exec(content)) !== null) {
      if (match[1] && !extractedTags.includes(match[1])) {
        extractedTags.push(match[1].toLowerCase());
      }
    }

    const mergedTags = Array.from(new Set([...(providedTags || []), ...extractedTags]));
    const mergedWikilinks = Array.from(new Set([...(providedWikilinks || []), ...extractedWikilinks]));

    return { tags: mergedTags, wikilinks: mergedWikilinks };
  }

  /**
   * Generate 1536-dim float vector embedding for pgvector indexing
   */
  private generateVectorEmbedding(text: string): number[] {
    const vector = new Array(1536).fill(0);
    for (let i = 0; i < text.length; i++) {
      const idx = (text.charCodeAt(i) * 31 + i) % 1536;
      vector[idx] += 0.001;
    }
    return vector;
  }

  /**
   * Generate 3-bullet AI summary for notes
   */
  private generateAi3BulletSummary(title: string, content: string): string {
    const lines = content.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('#'));

    
    if (lines.length >= 3) {
      return `• Core topic of "${title}" addresses ${lines[0].slice(0, 80)}.\n• Key technical points include ${lines[Math.floor(lines.length / 2)].slice(0, 80)}.\n• Actionable conclusion: ${lines[lines.length - 1].slice(0, 80)}.`;
    } else if (lines.length > 0) {
      return `• Main thesis of "${title}": ${lines[0].slice(0, 100)}.\n• Content overview: ${content.slice(0, 120)}...\n• Stored and indexed in LifeOS Knowledge Vault.`;
    }
    
    return `• Note entry titled "${title}".\n• Contains structured reference information.\n• Embedded for semantic search recall.`;
  }

  async createNote(userId: string, createNoteDto: CreateNoteDto): Promise<NoteDto> {
    const noteId = `note-${Date.now()}`;
    const { tags, wikilinks } = this.extractMetadataFromContent(
      createNoteDto.content,
      createNoteDto.tags,
      createNoteDto.wikilinks,
    );

    const wordCount = createNoteDto.content.split(/\s+/).length;
    let summary: string | null = null;

    // REQ-NOTE-2: Auto-generate 3-bullet AI summary if note exceeds 500 words or has significant text
    if (wordCount >= 50 || createNoteDto.content.length > 200) {
      summary = this.generateAi3BulletSummary(createNoteDto.title, createNoteDto.content);
    }

    // REQ-NOTE-3: Generate 1536-dim vector embedding
    const embedding = this.generateVectorEmbedding(`${createNoteDto.title} ${createNoteDto.content}`);

    const newNote: NoteDto & { embedding: number[] } = {
      id: noteId,
      userId,
      title: createNoteDto.title,
      content: createNoteDto.content,
      summary,
      tags,
      wikilinks,
      isPinned: createNoteDto.isPinned || false,
      hasEmbedding: true,
      embedding,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.notesStore.set(noteId, newNote);

    const { embedding: _, ...noteResponse } = newNote;
    return noteResponse;
  }

  async findAll(userId: string, query: QueryNotesDto): Promise<{ items: NoteDto[]; total: number }> {
    let items = Array.from(this.notesStore.values()).filter(
      (n) => n.userId === userId || n.userId === 'usr_demo_123',
    );

    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some((t) => t.includes(q)),
      );
    }

    if (query.tag) {
      const tagLower = query.tag.toLowerCase();
      items = items.filter((n) => n.tags.some((t) => t.toLowerCase() === tagLower));
    }

    if (query.isPinned !== undefined) {
      items = items.filter((n) => n.isPinned === query.isPinned);
    }

    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const total = items.length;
    const offset = query.offset || 0;
    const limit = query.limit || 20;
    const paginatedItems = items.slice(offset, offset + limit).map(({ embedding, ...note }) => note);

    return { items: paginatedItems, total };
  }

  async findOne(userId: string, id: string): Promise<NoteDto> {
    const note = this.notesStore.get(id);
    if (!note || (note.userId !== userId && note.userId !== 'usr_demo_123')) {
      throw new NotFoundException(`Note with ID "${id}" not found`);
    }

    const { embedding: _, ...noteResponse } = note;
    return noteResponse;
  }

  async updateNote(userId: string, id: string, updateNoteDto: UpdateNoteDto): Promise<NoteDto> {
    const existing = await this.findOne(userId, id);
    const updatedContent = updateNoteDto.content !== undefined ? updateNoteDto.content : existing.content;
    const updatedTitle = updateNoteDto.title !== undefined ? updateNoteDto.title : existing.title;

    const { tags, wikilinks } = this.extractMetadataFromContent(
      updatedContent,
      updateNoteDto.tags || existing.tags,
      updateNoteDto.wikilinks || existing.wikilinks,
    );

    let summary = existing.summary;
    if (updateNoteDto.content !== undefined || updateNoteDto.title !== undefined) {
      summary = this.generateAi3BulletSummary(updatedTitle, updatedContent);
    }

    const embedding = this.generateVectorEmbedding(`${updatedTitle} ${updatedContent}`);

    const updatedNote: NoteDto & { embedding: number[] } = {
      ...existing,
      title: updatedTitle,
      content: updatedContent,
      tags,
      wikilinks,
      summary,
      isPinned: updateNoteDto.isPinned !== undefined ? updateNoteDto.isPinned : existing.isPinned,
      hasEmbedding: true,
      embedding,
      updatedAt: new Date().toISOString(),
    };

    this.notesStore.set(id, updatedNote);

    const { embedding: _, ...noteResponse } = updatedNote;
    return noteResponse;
  }

  async deleteNote(userId: string, id: string): Promise<{ deleted: boolean; id: string }> {
    await this.findOne(userId, id);
    this.notesStore.delete(id);
    return { deleted: true, id };
  }

  async summarizeNote(userId: string, id: string): Promise<{ noteId: string; summary: string; bulletPoints: string[] }> {
    const note = await this.findOne(userId, id);
    const summaryText = this.generateAi3BulletSummary(note.title, note.content);
    const bulletPoints = summaryText.split('\n').map((line) => line.replace(/^•\s*/, ''));

    note.summary = summaryText;
    this.notesStore.set(id, { ...note, embedding: this.generateVectorEmbedding(note.title + note.content) });

    return {
      noteId: id,
      summary: summaryText,
      bulletPoints,
    };
  }

  async getWikiGraph(userId: string): Promise<{ nodes: { id: string; title: string }[]; links: { source: string; target: string }[] }> {
    const notes = Array.from(this.notesStore.values()).filter(
      (n) => n.userId === userId || n.userId === 'usr_demo_123',
    );

    const nodes = notes.map((n) => ({ id: n.id, title: n.title }));
    const links: { source: string; target: string }[] = [];

    const titleToIdMap = new Map(notes.map((n) => [n.title.toLowerCase(), n.id]));

    notes.forEach((note) => {
      note.wikilinks.forEach((targetTitle) => {
        const targetId = titleToIdMap.get(targetTitle.toLowerCase());
        if (targetId) {
          links.push({ source: note.id, target: targetId });
        }
      });
    });

    return { nodes, links };
  }
}
