import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentDto, UploadDocumentDto } from '@lifeos/shared-types';

export const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024; // 25MB (REQ-DOC-1)

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'image/png',
  'image/jpeg',
  'text/plain',
  'text/markdown',
];

@Injectable()
export class DocumentsService {
  private documentsStore: Map<string, DocumentDto> = new Map();

  constructor() {
    this.seedInitialDocuments();
  }

  private seedInitialDocuments(): void {
    const seed1: DocumentDto = {
      id: 'doc-001',
      userId: 'usr_default_01',
      fileName: 'Distributed_Systems_Lecture_04.pdf',
      fileUrl: 'https://storage.lifeos.internal/vault/usr_default_01/Distributed_Systems_Lecture_04.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 4200150, // ~4.2 MB
      summary: 'Analysis of Raft and Paxos consensus algorithms, leader election, and distributed log replication guarantees.',
      extractedText: 'Distributed Systems Lecture 04: Consensus and Fault Tolerance. Topics covered include Raft state machines, term numbers, Paxos two-phase commits, network partitions, and quorum-based consistency models.',
      tags: ['distributed-systems', 'consensus', 'raft', 'paxos'],
      createdAt: new Date('2026-09-28T10:00:00Z').toISOString(),
      updatedAt: new Date('2026-09-28T10:00:00Z').toISOString(),
    };

    const seed2: DocumentDto = {
      id: 'doc-002',
      userId: 'usr_default_01',
      fileName: 'LifeOS_System_Architecture_Spec.docx',
      fileUrl: 'https://storage.lifeos.internal/vault/usr_default_01/LifeOS_System_Architecture_Spec.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sizeBytes: 1845000, // ~1.8 MB
      summary: 'IEEE 830 Architecture specification defining NestJS modular backend, pgvector database layer, and React Native client.',
      extractedText: 'LifeOS IEEE 830 Specification Document. High-level architecture: NestJS modular monolith with asynchronous task queues, Redis caching, PostgreSQL 15 with pgvector extension, and SuperMemo-2 flashcards.',
      tags: ['architecture', 'ieee-830', 'spec'],
      createdAt: new Date('2026-09-29T14:30:00Z').toISOString(),
      updatedAt: new Date('2026-09-29T14:30:00Z').toISOString(),
    };

    this.documentsStore.set(seed1.id, seed1);
    this.documentsStore.set(seed2.id, seed2);
  }

  /**
   * REQ-DOC-1: Upload and validate document binary metadata
   */
  uploadDocument(userId: string, input: UploadDocumentDto): DocumentDto {
    if (!input.fileName || input.fileName.trim().length === 0) {
      throw new BadRequestException('fileName must be specified');
    }

    if (!input.mimeType || !ALLOWED_DOCUMENT_MIME_TYPES.includes(input.mimeType.toLowerCase())) {
      throw new BadRequestException(
        `Unsupported MIME type: '${input.mimeType}'. Allowed formats: PDF, DOCX, PNG, JPEG, TXT, MD`,
      );
    }

    if (input.sizeBytes <= 0) {
      throw new BadRequestException('sizeBytes must be greater than 0');
    }

    if (input.sizeBytes > MAX_DOCUMENT_SIZE_BYTES) {
      throw new BadRequestException(
        `File size (${(input.sizeBytes / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 25MB (REQ-DOC-1)`,
      );
    }

    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const extractedText = input.rawText || this.simulateTextExtraction(input.fileName, input.mimeType);
    const summary = input.summary || this.generateDocumentSummary(input.fileName, extractedText);

    const doc: DocumentDto = {
      id: documentId,
      userId,
      fileName: input.fileName.trim(),
      fileUrl: input.fileUrl || `https://storage.lifeos.internal/vault/${userId}/${encodeURIComponent(input.fileName)}`,
      mimeType: input.mimeType.toLowerCase(),
      sizeBytes: input.sizeBytes,
      summary,
      extractedText,
      tags: input.tags || ['vault', input.mimeType.split('/')[1] || 'doc'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.documentsStore.set(doc.id, doc);
    return doc;
  }

  /**
   * REQ-DOC-2: Full-text search across documents
   */
  searchDocuments(userId: string, query: string): DocumentDto[] {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      return this.getUserDocuments(userId);
    }

    return Array.from(this.documentsStore.values()).filter((doc) => {
      if (doc.userId !== userId) return false;
      const matchesName = doc.fileName.toLowerCase().includes(q);
      const matchesSummary = (doc.summary || '').toLowerCase().includes(q);
      const matchesText = (doc.extractedText || '').toLowerCase().includes(q);
      const matchesTags = doc.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesName || matchesSummary || matchesText || matchesTags;
    });
  }

  getUserDocuments(userId: string): DocumentDto[] {
    return Array.from(this.documentsStore.values())
      .filter((doc) => doc.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getDocumentById(userId: string, id: string): DocumentDto {
    const doc = this.documentsStore.get(id);
    if (!doc || doc.userId !== userId) {
      throw new NotFoundException(`Document with id '${id}' not found`);
    }
    return doc;
  }

  deleteDocument(userId: string, id: string): boolean {
    const doc = this.getDocumentById(userId, id);
    if (!doc) return false;
    return this.documentsStore.delete(id);
  }

  private simulateTextExtraction(fileName: string, mimeType: string): string {
    const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    return `Extracted textual content for ${cleanName} [Format: ${mimeType}]. Automatically indexed for PostgreSQL tsvector search queries.`;
  }

  private generateDocumentSummary(fileName: string, extractedText: string): string {
    const snippet = extractedText.substring(0, 150).trim();
    return `Summary of ${fileName}: ${snippet}...`;
  }
}
