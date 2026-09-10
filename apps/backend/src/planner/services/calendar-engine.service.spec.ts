import { Test, TestingModule } from '@nestjs/testing';
import { CalendarEngineService } from './calendar-engine.service';
import { NotFoundException } from '@nestjs/common';

describe('CalendarEngineService', () => {
  let service: CalendarEngineService;
  const mockUserId = 'user_test_calendar_123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendarEngineService],
    }).compile();

    service = module.get<CalendarEngineService>(CalendarEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create and retrieve a calendar event', async () => {
    const event = await service.create(mockUserId, {
      title: 'Cloud Architecture Final Presentation',
      description: 'Present microservices topology and resilience matrix',
      location: 'SJT 501',
      startTime: '2026-09-15T10:00:00.000Z',
      endTime: '2026-09-15T11:30:00.000Z',
      isAllDay: false,
      categoryColor: '#4F46E5',
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=TU',
    });

    expect(event).toBeDefined();
    expect(event.id).toMatch(/^event_/);
    expect(event.userId).toBe(mockUserId);
    expect(event.title).toBe('Cloud Architecture Final Presentation');
    expect(event.isAllDay).toBe(false);

    const found = await service.findById(mockUserId, event.id);
    expect(found.title).toBe('Cloud Architecture Final Presentation');
  });

  it('should filter events within a specified date range', async () => {
    await service.create(mockUserId, {
      title: 'Morning Sync',
      startTime: '2026-09-16T09:00:00.000Z',
      endTime: '2026-09-16T10:00:00.000Z',
    });

    await service.create(mockUserId, {
      title: 'Late Evening Study',
      startTime: '2026-09-16T20:00:00.000Z',
      endTime: '2026-09-16T21:00:00.000Z',
    });

    const rangeEvents = await service.findByUser(mockUserId, {
      from: '2026-09-16T08:00:00.000Z',
      to: '2026-09-16T12:00:00.000Z',
    });

    expect(rangeEvents.length).toBe(1);
    expect(rangeEvents[0].title).toBe('Morning Sync');
  });

  it('should deterministically detect event collisions and overlap minutes (REQ-PLAN-5)', async () => {
    await service.create(mockUserId, {
      title: 'Existing Class Lecture',
      startTime: '2026-09-17T14:00:00.000Z',
      endTime: '2026-09-17T16:00:00.000Z',
    });

    // 1. Overlapping proposal (15:00 to 17:00 -> 60 min overlap)
    const conflict = await service.checkConflicts(
      mockUserId,
      '2026-09-17T15:00:00.000Z',
      '2026-09-17T17:00:00.000Z',
    );

    expect(conflict.hasConflict).toBe(true);
    expect(conflict.conflictingEvents.length).toBe(1);
    expect(conflict.conflictingEvents[0].title).toBe('Existing Class Lecture');
    expect(conflict.overlapMinutes).toBe(60);

    // 2. Non-overlapping proposal (16:00 to 18:00)
    const noConflict = await service.checkConflicts(
      mockUserId,
      '2026-09-17T16:00:00.000Z',
      '2026-09-17T18:00:00.000Z',
    );
    expect(noConflict.hasConflict).toBe(false);
    expect(noConflict.overlapMinutes).toBe(0);
  });

  it('should find free focus blocks for schedule optimization (REQ-PLAN-6)', async () => {
    await service.create(mockUserId, {
      title: 'Midday Lecture',
      startTime: '2026-09-18T10:00:00.000Z',
      endTime: '2026-09-18T12:00:00.000Z',
    });

    const blocks = await service.findFreeFocusBlocks(
      mockUserId,
      '2026-09-18',
      8,
      16,
    );

    expect(blocks.length).toBeGreaterThanOrEqual(2);
    // Block 1: 08:00 to 10:00 (120 mins)
    expect(blocks[0].durationMinutes).toBe(120);
    // Block 2: 12:00 to 16:00 (240 mins)
    expect(blocks[1].durationMinutes).toBe(240);
  });

  it('should update and delete events cleanly', async () => {
    const event = await service.create(mockUserId, {
      title: 'Old Title',
      startTime: '2026-09-19T10:00:00.000Z',
      endTime: '2026-09-19T11:00:00.000Z',
    });

    const updated = await service.update(mockUserId, event.id, {
      title: 'New Title',
      location: 'Tech Park Hall',
    });
    expect(updated.title).toBe('New Title');
    expect(updated.location).toBe('Tech Park Hall');

    const res = await service.delete(mockUserId, event.id);
    expect(res.success).toBe(true);

    await expect(service.findById(mockUserId, event.id)).rejects.toThrow(
      NotFoundException,
    );
  });
});
