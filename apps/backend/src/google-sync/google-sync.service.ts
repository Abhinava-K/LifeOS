import { BadRequestException, Injectable, Logger, Optional } from '@nestjs/common';
import {
  GoogleConnectionStatusDto,
  GoogleConnectDto,
  GoogleServiceType,
  GoogleSyncLogDto,
  GoogleSyncResultDto,
  GoogleSyncStatus,
  TaskPriority,
  TaskStatus,
} from '@lifeos/shared-types';
import { CalendarEngineService } from '../planner/services/calendar-engine.service';
import { TaskService } from '../planner/services/task.service';
import { DocumentsService } from '../documents/documents.service';

interface UserGoogleProfile {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  status: GoogleSyncStatus;
  enabledServices: GoogleServiceType[];
  lastSyncAt: string | null;
  syncErrors: string[];
}

@Injectable()
export class GoogleSyncService {
  private readonly logger = new Logger(GoogleSyncService.name);
  private connections: Map<string, UserGoogleProfile> = new Map();
  private syncLogs: Map<string, GoogleSyncLogDto[]> = new Map();

  constructor(
    @Optional() private readonly calendarService?: CalendarEngineService,
    @Optional() private readonly taskService?: TaskService,
    @Optional() private readonly documentsService?: DocumentsService,
  ) {
    this.seedDefaultConnection();
  }

  private seedDefaultConnection() {
    const demoUserId = 'usr_demo_123';
    this.connections.set(demoUserId, {
      userId: demoUserId,
      email: 'abhinava.k2024@vitstudent.ac.in',
      accessToken: 'ya29.mock_oauth_access_token_demo',
      refreshToken: '1//0g_mock_refresh_token_lifeos',
      expiresAt: Date.now() + 3600 * 1000,
      status: GoogleSyncStatus.CONNECTED,
      enabledServices: [
        GoogleServiceType.CALENDAR,
        GoogleServiceType.GMAIL,
        GoogleServiceType.DRIVE,
        GoogleServiceType.CONTACTS,
      ],
      lastSyncAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      syncErrors: [],
    });

    this.syncLogs.set(demoUserId, [
      {
        id: 'log-001',
        timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
        service: GoogleServiceType.CALENDAR,
        status: 'SUCCESS',
        itemsSynced: 3,
        details: 'Bi-directional calendar sync: 3 events synced',
      },
      {
        id: 'log-002',
        timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
        service: GoogleServiceType.GMAIL,
        status: 'SUCCESS',
        itemsSynced: 2,
        details: 'Extracted 2 action items from unread academic threads',
      },
    ]);
  }

  async getConnectionStatus(userId: string): Promise<GoogleConnectionStatusDto> {
    const conn = this.connections.get(userId);
    if (!conn || conn.status === GoogleSyncStatus.DISCONNECTED) {
      return {
        isConnected: false,
        email: null,
        status: GoogleSyncStatus.DISCONNECTED,
        lastSyncAt: null,
        enabledServices: [],
        syncErrors: [],
      };
    }

    return {
      isConnected: conn.status === GoogleSyncStatus.CONNECTED || conn.status === GoogleSyncStatus.SYNCING,
      email: conn.email,
      status: conn.status,
      lastSyncAt: conn.lastSyncAt,
      enabledServices: conn.enabledServices,
      syncErrors: conn.syncErrors,
    };
  }

  async connect(userId: string, dto: GoogleConnectDto): Promise<GoogleConnectionStatusDto> {
    const email = dto.email || 'connected.user@gmail.com';
    const now = new Date().toISOString();

    const profile: UserGoogleProfile = {
      userId,
      email,
      accessToken: `ya29.mock_${Date.now()}_tok`,
      refreshToken: `1//0_mock_ref_${Date.now()}`,
      expiresAt: Date.now() + 3600 * 1000,
      status: GoogleSyncStatus.CONNECTED,
      enabledServices: [
        GoogleServiceType.CALENDAR,
        GoogleServiceType.GMAIL,
        GoogleServiceType.DRIVE,
        GoogleServiceType.CONTACTS,
      ],
      lastSyncAt: now,
      syncErrors: [],
    };

    this.connections.set(userId, profile);
    this.logger.log(`🔗 Google Workspace linked for user: ${userId} (${email})`);

    return this.getConnectionStatus(userId);
  }

  async disconnect(userId: string): Promise<boolean> {
    const conn = this.connections.get(userId);
    if (conn) {
      conn.status = GoogleSyncStatus.DISCONNECTED;
      conn.accessToken = '';
      conn.refreshToken = '';
      this.connections.set(userId, conn);
    }
    this.logger.log(`🔌 Google Workspace unlinked for user: ${userId}`);
    return true;
  }

  async triggerSync(
    userId: string,
    options?: { services?: GoogleServiceType[]; forceFullSync?: boolean },
  ): Promise<GoogleSyncResultDto> {
    const startTime = Date.now();
    const conn = this.connections.get(userId);

    if (!conn || conn.status === GoogleSyncStatus.DISCONNECTED) {
      throw new BadRequestException('Google Workspace is not connected. Please authenticate first.');
    }

    conn.status = GoogleSyncStatus.SYNCING;
    const servicesToSync = options?.services?.length ? options.services : conn.enabledServices;

    const counts = {
      calendar: 0,
      emails: 0,
      drive: 0,
      contacts: 0,
    };

    try {
      // 1. Google Calendar Sync
      if (servicesToSync.includes(GoogleServiceType.CALENDAR) && this.calendarService) {
        counts.calendar = await this.syncCalendarEvents(userId);
      }

      // 2. Gmail Action Item Extraction
      if (servicesToSync.includes(GoogleServiceType.GMAIL) && this.taskService) {
        counts.emails = await this.syncGmailTasks(userId);
      }

      // 3. Google Drive Sync
      if (servicesToSync.includes(GoogleServiceType.DRIVE) && this.documentsService) {
        counts.drive = await this.syncDriveFiles(userId);
      }

      // 4. Contacts Sync
      if (servicesToSync.includes(GoogleServiceType.CONTACTS)) {
        counts.contacts = 4; // Simulated contact book sync
      }

      const isoNow = new Date().toISOString();
      conn.status = GoogleSyncStatus.CONNECTED;
      conn.lastSyncAt = isoNow;
      this.connections.set(userId, conn);

      // Record logs
      const logs = this.syncLogs.get(userId) || [];
      const newLog: GoogleSyncLogDto = {
        id: `log_${Date.now()}`,
        timestamp: isoNow,
        service: GoogleServiceType.CALENDAR,
        status: 'SUCCESS',
        itemsSynced: counts.calendar + counts.emails + counts.drive + counts.contacts,
        details: `Synced ${counts.calendar} events, ${counts.emails} tasks from email, ${counts.drive} drive docs`,
      };
      logs.unshift(newLog);
      this.syncLogs.set(userId, logs.slice(0, 20));

      const durationMs = Date.now() - startTime;
      return {
        jobId: `job_${Date.now()}`,
        status: 'SUCCESS',
        syncedItemsCount: counts,
        timestamp: isoNow,
        durationMs,
        message: 'Google Workspace sync completed successfully across all selected services.',
      };
    } catch (error: any) {
      conn.status = GoogleSyncStatus.ERROR;
      conn.syncErrors.push(error.message);
      this.connections.set(userId, conn);
      throw error;
    }
  }

  private async syncCalendarEvents(userId: string): Promise<number> {
    if (!this.calendarService) return 0;

    const mockGoogleEvents = [
      {
        title: 'SWE Project Phase 5 Review with Prof',
        description: 'Synchronized from Google Calendar (room SJT-401)',
        startTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        endTime: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
        location: 'SJT-401 / Google Meet',
        categoryColor: '#4285F4',
        isAllDay: false,
      },
      {
        title: 'DAA Lab Comprehensive Evaluation',
        description: 'Synchronized from Google Calendar',
        startTime: new Date(Date.now() + 26 * 3600 * 1000).toISOString(),
        endTime: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
        location: 'Tech Park 204',
        categoryColor: '#EA4335',
        isAllDay: false,
      },
    ];

    let createdCount = 0;
    for (const item of mockGoogleEvents) {
      try {
        await this.calendarService.create(userId, item);
        createdCount++;
      } catch (err) {
        this.logger.warn(`Skipping event sync: ${err.message}`);
      }
    }
    return createdCount;
  }

  private async syncGmailTasks(userId: string): Promise<number> {
    if (!this.taskService) return 0;

    const extractedActionItems = [
      {
        title: 'Submit VIT DAA Assignment 2 on VTOP',
        description: 'Auto-extracted from Gmail email thread: "Assignment 2 submission deadline extended to Friday"',
        priority: TaskPriority.URGENT_IMPORTANT,
        status: TaskStatus.TODO,
        dueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        tags: ['email-sync', 'gmail', 'assignment', 'vit'],
      },
      {
        title: 'Confirm attendance for Tech Conclave Hackathon',
        description: 'Auto-extracted from Gmail invite: "RSVP requested by end of day"',
        priority: TaskPriority.NOT_URGENT_IMPORTANT,
        status: TaskStatus.TODO,
        dueDate: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
        tags: ['email-sync', 'gmail', 'hackathon'],
      },
    ];

    let createdCount = 0;
    for (const item of extractedActionItems) {
      try {
        await this.taskService.create(userId, item);
        createdCount++;
      } catch (err) {
        this.logger.warn(`Skipping email task sync: ${err.message}`);
      }
    }
    return createdCount;
  }

  private async syncDriveFiles(userId: string): Promise<number> {
    if (!this.documentsService) return 0;

    try {
      this.documentsService.uploadDocument(userId, {
        fileName: 'GoogleDrive_SWE_Design_Patterns_Handout.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 2540000,
        tags: ['google-drive', 'swe', 'lecture'],
      });
      return 1;
    } catch {
      return 0;
    }
  }

  async getLogs(userId: string): Promise<GoogleSyncLogDto[]> {
    return this.syncLogs.get(userId) || [];
  }

  async getSyncLogs(userId: string): Promise<GoogleSyncLogDto[]> {
    return this.getLogs(userId);
  }
}
