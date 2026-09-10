import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CalendarEventDto,
  EventConflictDto,
} from '@lifeos/shared-types';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from '../dto/planner.dto';
import * as crypto from 'crypto';

@Injectable()
export class CalendarEngineService {
  private events: Map<string, CalendarEventDto> = new Map();

  constructor() {
    this.seedSampleEvents();
  }

  private seedSampleEvents(): void {
    const defaultUserId = 'user_vit_student_001';
    const now = new Date();
    const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
    const todayNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0);

    const sampleEvents: Array<Omit<CalendarEventDto, 'id' | 'createdAt' | 'updatedAt'>> = [
      {
        userId: defaultUserId,
        title: 'SWE Project Review Meeting',
        description: 'Review with project guide',
        location: 'SJT 401',
        startTime: todayMorning.toISOString(),
        endTime: new Date(todayMorning.getTime() + 60 * 60 * 1000).toISOString(),
        isAllDay: false,
        categoryColor: '#6366F1',
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
        isGoogleSync: true,
        googleEventId: 'g_event_swe_001',
      },
      {
        userId: defaultUserId,
        title: 'Operating Systems Lab Exam',
        description: 'Virtual memory algorithms & page replacement lab',
        location: 'Lab 3 / Tech Park',
        startTime: todayNoon.toISOString(),
        endTime: new Date(todayNoon.getTime() + 90 * 60 * 1000).toISOString(),
        isAllDay: false,
        categoryColor: '#EF4444',
        recurrenceRule: null,
        isGoogleSync: false,
        googleEventId: null,
      },
    ];

    for (const item of sampleEvents) {
      const id = `event_${crypto.randomUUID()}`;
      const timestamp = new Date().toISOString();
      this.events.set(id, {
        ...item,
        id,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
  }

  async findByUser(
    userId: string,
    query?: { from?: string; to?: string },
  ): Promise<CalendarEventDto[]> {
    let list = Array.from(this.events.values()).filter(
      (e) => e.userId === userId,
    );

    if (query?.from) {
      const fromTime = new Date(query.from).getTime();
      list = list.filter((e) => new Date(e.endTime).getTime() >= fromTime);
    }
    if (query?.to) {
      const toTime = new Date(query.to).getTime();
      list = list.filter((e) => new Date(e.startTime).getTime() <= toTime);
    }

    return list.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
  }

  async findById(userId: string, eventId: string): Promise<CalendarEventDto> {
    const event = this.events.get(eventId);
    if (!event || event.userId !== userId) {
      throw new NotFoundException(`Calendar event with ID ${eventId} not found`);
    }
    return event;
  }

  async create(userId: string, dto: CreateCalendarEventDto): Promise<CalendarEventDto> {
    const id = `event_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const newEvent: CalendarEventDto = {
      id,
      userId,
      title: dto.title,
      description: dto.description || null,
      location: dto.location || null,
      startTime: dto.startTime,
      endTime: dto.endTime,
      isAllDay: !!dto.isAllDay,
      categoryColor: dto.categoryColor || '#3B82F6',
      recurrenceRule: dto.recurrenceRule || null,
      isGoogleSync: false,
      googleEventId: null,
      createdAt: now,
      updatedAt: now,
    };

    this.events.set(id, newEvent);
    return newEvent;
  }

  async update(
    userId: string,
    eventId: string,
    dto: UpdateCalendarEventDto,
  ): Promise<CalendarEventDto> {
    const event = await this.findById(userId, eventId);
    const now = new Date().toISOString();

    if (dto.title !== undefined) event.title = dto.title;
    if (dto.description !== undefined) event.description = dto.description;
    if (dto.location !== undefined) event.location = dto.location;
    if (dto.startTime !== undefined) event.startTime = dto.startTime;
    if (dto.endTime !== undefined) event.endTime = dto.endTime;
    if (dto.isAllDay !== undefined) event.isAllDay = dto.isAllDay;
    if (dto.categoryColor !== undefined) event.categoryColor = dto.categoryColor;
    if (dto.recurrenceRule !== undefined) event.recurrenceRule = dto.recurrenceRule;
    event.updatedAt = now;

    this.events.set(eventId, event);
    return event;
  }

  async delete(userId: string, eventId: string): Promise<{ success: boolean; id: string }> {
    await this.findById(userId, eventId);
    this.events.delete(eventId);
    return { success: true, id: eventId };
  }

  /**
   * Deterministic event conflict detection (REQ-PLAN-5)
   */
  async checkConflicts(
    userId: string,
    startTime: string,
    endTime: string,
    excludeEventId?: string,
  ): Promise<EventConflictDto> {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    const allEvents = await this.findByUser(userId);
    const conflicting = allEvents.filter((e) => {
      if (excludeEventId && e.id === excludeEventId) return false;
      const eStart = new Date(e.startTime).getTime();
      const eEnd = new Date(e.endTime).getTime();

      // Overlap occurs if (start < eEnd) and (end > eStart)
      return start < eEnd && end > eStart;
    });

    let totalOverlapMinutes = 0;
    for (const conf of conflicting) {
      const eStart = new Date(conf.startTime).getTime();
      const eEnd = new Date(conf.endTime).getTime();
      const overlapStart = Math.max(start, eStart);
      const overlapEnd = Math.min(end, eEnd);
      totalOverlapMinutes += Math.max(0, Math.round((overlapEnd - overlapStart) / 60000));
    }

    return {
      hasConflict: conflicting.length > 0,
      conflictingEvents: conflicting,
      overlapMinutes: totalOverlapMinutes,
    };
  }

  /**
   * Focus window analyzer for automatic AI schedule optimization (REQ-PLAN-6)
   */
  async findFreeFocusBlocks(
    userId: string,
    dateString: string, // YYYY-MM-DD or ISO string
    dayStartHour: number = 8,
    dayEndHour: number = 20,
  ): Promise<Array<{ startTime: string; endTime: string; durationMinutes: number }>> {
    const rawDatePart = dateString.split('T')[0];
    const [year, month, day] = rawDatePart.split('-').map((v) => parseInt(v, 10));

    const windowStartMs = Date.UTC(year, month - 1, day, dayStartHour, 0, 0);
    const windowEndMs = Date.UTC(year, month - 1, day, dayEndHour, 0, 0);

    const windowStartIso = new Date(windowStartMs).toISOString();
    const windowEndIso = new Date(windowEndMs).toISOString();

    const dayEvents = await this.findByUser(userId, {
      from: windowStartIso,
      to: windowEndIso,
    });

    const sorted = [...dayEvents].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    const freeBlocks: Array<{ startTime: string; endTime: string; durationMinutes: number }> = [];
    let currentPointer = windowStartMs;

    for (const ev of sorted) {
      const evStart = Math.max(windowStartMs, new Date(ev.startTime).getTime());
      const evEnd = Math.min(windowEndMs, new Date(ev.endTime).getTime());

      if (evStart > currentPointer) {
        const gapMinutes = Math.round((evStart - currentPointer) / 60000);
        if (gapMinutes >= 15) {
          freeBlocks.push({
            startTime: new Date(currentPointer).toISOString(),
            endTime: new Date(evStart).toISOString(),
            durationMinutes: gapMinutes,
          });
        }
      }
      currentPointer = Math.max(currentPointer, evEnd);
    }

    if (currentPointer < windowEndMs) {
      const gapMinutes = Math.round((windowEndMs - currentPointer) / 60000);
      if (gapMinutes >= 15) {
        freeBlocks.push({
          startTime: new Date(currentPointer).toISOString(),
          endTime: new Date(windowEndMs).toISOString(),
          durationMinutes: gapMinutes,
        });
      }
    }

    return freeBlocks;
  }
}
