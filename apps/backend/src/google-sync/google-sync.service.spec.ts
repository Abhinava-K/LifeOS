import { Test, TestingModule } from '@nestjs/testing';
import { GoogleSyncService } from './google-sync.service';
import { CalendarEngineService } from '../planner/services/calendar-engine.service';
import { TaskService } from '../planner/services/task.service';
import { DocumentsService } from '../documents/documents.service';
import { GoogleServiceType } from '@lifeos/shared-types';

describe('GoogleSyncService', () => {
  let service: GoogleSyncService;
  let calendarService: CalendarEngineService;
  let taskService: TaskService;
  let documentsService: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleSyncService, CalendarEngineService, TaskService, DocumentsService],
    }).compile();

    service = module.get<GoogleSyncService>(GoogleSyncService);
    calendarService = module.get<CalendarEngineService>(CalendarEngineService);
    taskService = module.get<TaskService>(TaskService);
    documentsService = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(calendarService).toBeDefined();
    expect(taskService).toBeDefined();
    expect(documentsService).toBeDefined();
  });

  it('should return default connection status for demo user', async () => {
    const status = await service.getConnectionStatus('usr_demo_123');
    expect(status.isConnected).toBe(true);
    expect(status.email).toContain('abhinava.k2024@vitstudent.ac.in');
    expect(status.enabledServices).toContain(GoogleServiceType.CALENDAR);
    expect(status.enabledServices).toContain(GoogleServiceType.GMAIL);
  });

  it('should connect a new user to Google Workspace', async () => {
    const res = await service.connect('usr_new_google', {
      email: 'test.student@gmail.com',
      authCode: 'mock_code_12345',
    });

    expect(res.isConnected).toBe(true);
    expect(res.email).toBe('test.student@gmail.com');
  });

  it('should trigger full bi-directional sync across Calendar, Gmail, Drive & Contacts', async () => {
    const result = await service.triggerSync('usr_demo_123');

    expect(result.status).toBe('SUCCESS');
    expect(result.jobId).toBeDefined();
    expect(result.syncedItemsCount.calendar).toBeGreaterThan(0);
    expect(result.syncedItemsCount.emails).toBeGreaterThan(0);
    expect(result.syncedItemsCount.drive).toBeGreaterThan(0);
    expect(result.syncedItemsCount.contacts).toBe(4);
  });

  it('should retrieve audit logs after sync execution', async () => {
    await service.triggerSync('usr_demo_123');
    const logs = await service.getLogs('usr_demo_123');

    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].status).toBe('SUCCESS');
  });

  it('should disconnect Google account', async () => {
    await service.disconnect('usr_demo_123');
    const status = await service.getConnectionStatus('usr_demo_123');
    expect(status.isConnected).toBe(false);
  });
});
