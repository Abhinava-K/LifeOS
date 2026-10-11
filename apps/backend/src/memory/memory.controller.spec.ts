import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MemoryController } from './memory.controller';
import { MemoryService } from './services/memory.service';
import { EmbeddingService } from './services/embedding.service';
import { ContextBuilderService } from './services/context-builder.service';
import { MemoryCategory } from '@lifeos/shared-types';

describe('MemoryController', () => {
  let controller: MemoryController;
  let service: MemoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemoryController],
      providers: [MemoryService, EmbeddingService, ContextBuilderService],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MemoryController>(MemoryController);
    service = module.get<MemoryService>(MemoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create memory via controller', async () => {
    const mockReq = { user: { userId: 'usr_demo_123' } } as any;
    const res = await controller.createMemory(mockReq, {
      content: 'Consistently drinks 3 liters of water per day.',
      category: MemoryCategory.PREFERENCE,
      importance: 6,
      tags: ['health', 'water'],
    });

    expect(res.success).toBe(true);
    expect(res.data.id).toBeDefined();
    expect(res.data.content).toContain('3 liters of water');
  });

  it('should recall memory via controller', async () => {
    const mockReq = { user: { userId: 'usr_demo_123' } } as any;
    const res = await controller.recallMemories(mockReq, {
      query: 'GPA goal in VIT',
      limit: 3,
    });

    expect(res.success).toBe(true);
    expect(res.data.totalFound).toBeGreaterThanOrEqual(1);
  });

  it('should fetch stats via controller', async () => {
    const mockReq = { user: { userId: 'usr_demo_123' } } as any;
    const res = await controller.getStats(mockReq);

    expect(res.success).toBe(true);
    expect(res.data.totalMemories).toBeGreaterThan(0);
  });
});
