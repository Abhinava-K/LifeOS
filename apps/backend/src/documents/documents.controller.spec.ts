import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [DocumentsService],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all documents for user', () => {
    const response = controller.getDocuments();
    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('should search documents', () => {
    const response = controller.searchDocuments('Distributed');
    expect(response.success).toBe(true);
    expect(response.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should upload a document', () => {
    const response = controller.uploadDocument({
      fileName: 'test-paper.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1048576,
    });
    expect(response.success).toBe(true);
    expect(response.data.fileName).toBe('test-paper.pdf');
  });

  it('should retrieve a document by id', () => {
    const uploadRes = controller.uploadDocument({
      fileName: 'fetch-test.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 50000,
    });
    const fetchRes = controller.getDocumentById(uploadRes.data.id);
    expect(fetchRes.success).toBe(true);
    expect(fetchRes.data.id).toBe(uploadRes.data.id);
  });
});
