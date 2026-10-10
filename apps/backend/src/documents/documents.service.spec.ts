import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MAX_DOCUMENT_SIZE_BYTES, DocumentsService } from './documents.service';

describe('DocumentsService (REQ-DOC)', () => {
  let service: DocumentsService;
  const testUserId = 'usr_test_999';

  beforeEach(() => {
    service = new DocumentsService();
  });

  it('should seed initial documents', () => {
    const docs = service.getUserDocuments('usr_default_01');
    expect(docs.length).toBeGreaterThanOrEqual(2);
    expect(docs[0]).toHaveProperty('id');
    expect(docs[0]).toHaveProperty('fileName');
  });

  describe('uploadDocument (REQ-DOC-1 & REQ-DOC-2)', () => {
    it('should successfully upload and index a PDF document under 25MB', () => {
      const doc = service.uploadDocument(testUserId, {
        fileName: 'Algorithm_Design_Manual.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 12 * 1024 * 1024, // 12 MB
        rawText: 'Graph algorithms: Dijkstra, Bellman-Ford, Kruskal and Prim.',
        tags: ['algorithms', 'cs'],
      });

      expect(doc.id).toBeDefined();
      expect(doc.fileName).toBe('Algorithm_Design_Manual.pdf');
      expect(doc.sizeBytes).toBe(12 * 1024 * 1024);
      expect(doc.extractedText).toContain('Dijkstra');
      expect(doc.summary).toBeDefined();
    });

    it('should reject documents exceeding 25MB (REQ-DOC-1)', () => {
      expect(() => {
        service.uploadDocument(testUserId, {
          fileName: 'Huge_Database_Dump.pdf',
          mimeType: 'application/pdf',
          sizeBytes: MAX_DOCUMENT_SIZE_BYTES + 1024, // > 25MB
        });
      }).toThrow(BadRequestException);
    });

    it('should reject documents with unsupported MIME types', () => {
      expect(() => {
        service.uploadDocument(testUserId, {
          fileName: 'malicious.exe',
          mimeType: 'application/x-msdownload',
          sizeBytes: 1024,
        });
      }).toThrow(BadRequestException);
    });

    it('should reject documents with empty file names', () => {
      expect(() => {
        service.uploadDocument(testUserId, {
          fileName: '',
          mimeType: 'application/pdf',
          sizeBytes: 1024,
        });
      }).toThrow(BadRequestException);
    });
  });

  describe('searchDocuments (REQ-DOC-2)', () => {
    it('should search documents by keywords in file name or extracted text', () => {
      service.uploadDocument(testUserId, {
        fileName: 'Quantum_Computing_Overview.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 204800,
        rawText: 'Qubits, superposition and quantum entanglement algorithms.',
        tags: ['physics', 'quantum'],
      });

      const results = service.searchDocuments(testUserId, 'entanglement');
      expect(results.length).toBe(1);
      expect(results[0].fileName).toBe('Quantum_Computing_Overview.pdf');
    });

    it('should return empty list when no matches found', () => {
      const results = service.searchDocuments(testUserId, 'nonexistent_query_term');
      expect(results.length).toBe(0);
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document by ID', () => {
      const doc = service.uploadDocument(testUserId, {
        fileName: 'temporary.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 5000,
      });

      const deleted = service.deleteDocument(testUserId, doc.id);
      expect(deleted).toBe(true);

      expect(() => service.getDocumentById(testUserId, doc.id)).toThrow(NotFoundException);
    });
  });
});
