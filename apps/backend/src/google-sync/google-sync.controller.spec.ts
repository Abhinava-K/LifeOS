import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GoogleSyncController } from './google-sync.controller';
import { GoogleSyncService } from './google-sync.service';
import { CalendarEngineService } from '../planner/services/calendar-engine.service';
import { TaskService } from '../planner/services/task.service';
import { DocumentsService } from '../documents/documents.service';

describe('GoogleSyncController', () => {
  let controller: GoogleSyncController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleSyncController],
      providers: [GoogleSyncService, CalendarEngineService, TaskService, DocumentsService],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<GoogleSyncController>(GoogleSyncController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get connection status via controller', async () => {
    const mockReq = { user: { userId: 'usr_demo_123' } } as any;
    const res = await controller.getStatus(mockReq);

    expect(res.success).toBe(true);
    expect(res.data.isConnected).toBe(true);
  });

  it('should trigger sync via controller', async () => {
    const mockReq = { user: { userId: 'usr_demo_123' } } as any;
    const res = await controller.triggerSync(mockReq, {});

    expect(res.success).toBe(true);
    expect(res.data.status).toBe('SUCCESS');
    expect(res.data.syncedItemsCount).toBeDefined();
  });

  it('should get sync logs via controller', async () => {
    const mockReq = { user: { userId: 'usr_demo_123' } } as any;
    const res = await controller.getLogs(mockReq);

    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
  });
});
