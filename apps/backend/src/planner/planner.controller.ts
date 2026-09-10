import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaskService } from './services/task.service';
import { CalendarEngineService } from './services/calendar-engine.service';
import { HabitEngineService } from './services/habit-engine.service';
import { GoalService } from './services/goal.service';
import { NotificationSchedulerService } from './services/notification-scheduler.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
  CreateHabitDto,
  UpdateHabitDto,
  HabitLogActionDto,
  CreateGoalDto,
  UpdateGoalDto,
} from './dto/planner.dto';
import {
  GoalCategory,
  StandardApiResponse,
  TaskPriority,
  TaskStatus,
} from '@lifeos/shared-types';

@ApiTags('Planner & Productivity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('planner')
export class PlannerController {
  constructor(
    private readonly taskService: TaskService,
    private readonly calendarService: CalendarEngineService,
    private readonly habitService: HabitEngineService,
    private readonly goalService: GoalService,
    private readonly notificationService: NotificationSchedulerService,
  ) {}

  // ══════════════════════════════════════════════════════════
  // DAILY BRIEFING & REMINDERS (REQ-PLAN-6)
  // ══════════════════════════════════════════════════════════

  @Get('briefing')
  @ApiOperation({ summary: 'Get unified daily briefing and schedule digest' })
  @ApiResponse({ status: 200, description: 'Daily briefing generated successfully' })
  async getDailyBriefing(@Request() req: any): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const briefing = await this.notificationService.generateDailyBriefing(userId);
    return {
      success: true,
      data: briefing,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('reminders')
  @ApiOperation({ summary: 'Get active pending reminders and upcoming alarms' })
  async getPendingReminders(@Request() req: any): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const reminders = await this.notificationService.getPendingReminders(userId);
    return {
      success: true,
      data: reminders,
      timestamp: new Date().toISOString(),
    };
  }

  // ══════════════════════════════════════════════════════════
  // TASKS & EISENHOWER MATRIX (REQ-PLAN-2)
  // ══════════════════════════════════════════════════════════

  @Get('tasks')
  @ApiOperation({ summary: 'Fetch all user tasks with optional filtering' })
  @ApiQuery({ name: 'priority', enum: TaskPriority, required: false })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getTasks(
    @Request() req: any,
    @Query('priority') priority?: TaskPriority,
    @Query('status') status?: TaskStatus,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const tasks = await this.taskService.findByUser(userId, {
      priority,
      status,
      tag,
      search,
    });
    return {
      success: true,
      data: tasks,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('tasks/eisenhower')
  @ApiOperation({ summary: 'Get tasks grouped into 4 Eisenhower Matrix quadrants' })
  async getEisenhowerMatrix(@Request() req: any): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const matrix = await this.taskService.getEisenhowerMatrix(userId);
    return {
      success: true,
      data: matrix,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get task by ID' })
  async getTaskById(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const task = await this.taskService.findById(userId, id);
    return {
      success: true,
      data: task,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('tasks')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  async createTask(
    @Request() req: any,
    @Body() dto: CreateTaskDto,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const task = await this.taskService.create(userId, dto);
    return {
      success: true,
      data: task,
      message: 'Task created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update a task' })
  async updateTask(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const updated = await this.taskService.update(userId, id, dto);
    return {
      success: true,
      data: updated,
      message: 'Task updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('tasks/:id/checklist/:itemId/toggle')
  @ApiOperation({ summary: 'Toggle subtask/checklist item status' })
  async toggleChecklistItem(
    @Request() req: any,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const task = await this.taskService.toggleChecklistItem(userId, id, itemId);
    return {
      success: true,
      data: task,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('tasks/:id')
  @ApiOperation({ summary: 'Delete a task' })
  async deleteTask(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const result = await this.taskService.delete(userId, id);
    return {
      success: true,
      data: result,
      message: 'Task deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }

  // ══════════════════════════════════════════════════════════
  // CALENDAR & CONFLICT DETECTION (REQ-PLAN-1, REQ-PLAN-5)
  // ══════════════════════════════════════════════════════════

  @Get('events')
  @ApiOperation({ summary: 'Fetch user calendar events with date-range filter' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getEvents(
    @Request() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const events = await this.calendarService.findByUser(userId, { from, to });
    return {
      success: true,
      data: events,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('events/conflicts')
  @ApiOperation({ summary: 'Detect schedule collisions and overlap minutes (REQ-PLAN-5)' })
  @ApiQuery({ name: 'startTime', required: true })
  @ApiQuery({ name: 'endTime', required: true })
  @ApiQuery({ name: 'excludeId', required: false })
  async checkConflicts(
    @Request() req: any,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('excludeId') excludeId?: string,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const conflicts = await this.calendarService.checkConflicts(
      userId,
      startTime,
      endTime,
      excludeId,
    );
    return {
      success: true,
      data: conflicts,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('events/focus-blocks')
  @ApiOperation({ summary: 'Find open focus windows for schedule optimization' })
  @ApiQuery({ name: 'date', required: true, example: '2026-09-15' })
  async getFocusBlocks(
    @Request() req: any,
    @Query('date') date: string,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const blocks = await this.calendarService.findFreeFocusBlocks(userId, date);
    return {
      success: true,
      data: blocks,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Get calendar event by ID' })
  async getEventById(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const event = await this.calendarService.findById(userId, id);
    return {
      success: true,
      data: event,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a calendar event' })
  async createEvent(
    @Request() req: any,
    @Body() dto: CreateCalendarEventDto,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const event = await this.calendarService.create(userId, dto);
    return {
      success: true,
      data: event,
      message: 'Event created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('events/:id')
  @ApiOperation({ summary: 'Update a calendar event' })
  async updateEvent(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCalendarEventDto,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const updated = await this.calendarService.update(userId, id, dto);
    return {
      success: true,
      data: updated,
      message: 'Event updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Delete a calendar event' })
  async deleteEvent(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const result = await this.calendarService.delete(userId, id);
    return {
      success: true,
      data: result,
      message: 'Event deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }

  // ══════════════════════════════════════════════════════════
  // HABITS & STREAKS (REQ-PLAN-4)
  // ══════════════════════════════════════════════════════════

  @Get('habits')
  @ApiOperation({ summary: 'Fetch user habits with current & longest streaks' })
  async getHabits(@Request() req: any): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const habits = await this.habitService.findByUser(userId);
    return {
      success: true,
      data: habits,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('habits/:id')
  @ApiOperation({ summary: 'Get habit by ID' })
  async getHabitById(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const habit = await this.habitService.findById(userId, id);
    return {
      success: true,
      data: habit,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('habits')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new habit' })
  async createHabit(
    @Request() req: any,
    @Body() dto: CreateHabitDto,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const habit = await this.habitService.create(userId, dto);
    return {
      success: true,
      data: habit,
      message: 'Habit created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('habits/:id')
  @ApiOperation({ summary: 'Update a habit' })
  async updateHabit(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const updated = await this.habitService.update(userId, id, dto);
    return {
      success: true,
      data: updated,
      message: 'Habit updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('habits/:id/toggle')
  @ApiOperation({ summary: 'Toggle completion for today or specific date' })
  async toggleHabit(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto?: HabitLogActionDto,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const result = await this.habitService.toggleHabitCompletion(userId, id, dto);
    return {
      success: true,
      data: result,
      message: result.completed ? 'Habit marked as completed' : 'Habit completion undone',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('habits/:id/analytics')
  @ApiOperation({ summary: 'Get habit streak analytics and 30-day completion rate' })
  async getHabitAnalytics(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const analytics = await this.habitService.getAnalytics(userId, id);
    return {
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('habits/:id')
  @ApiOperation({ summary: 'Delete a habit' })
  async deleteHabit(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const result = await this.habitService.delete(userId, id);
    return {
      success: true,
      data: result,
      message: 'Habit deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }

  // ══════════════════════════════════════════════════════════
  // GOALS & MILESTONES (REQ-PLAN-3)
  // ══════════════════════════════════════════════════════════

  @Get('goals')
  @ApiOperation({ summary: 'Fetch user long-term goals and progress milestones' })
  @ApiQuery({ name: 'category', enum: GoalCategory, required: false })
  @ApiQuery({ name: 'includeArchived', required: false })
  async getGoals(
    @Request() req: any,
    @Query('category') category?: GoalCategory,
    @Query('includeArchived') includeArchived?: boolean,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const goals = await this.goalService.findByUser(userId, {
      category,
      includeArchived: !!includeArchived,
    });
    return {
      success: true,
      data: goals,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('goals/:id')
  @ApiOperation({ summary: 'Get goal by ID' })
  async getGoalById(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const goal = await this.goalService.findById(userId, id);
    return {
      success: true,
      data: goal,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('goals')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new long-term goal' })
  async createGoal(
    @Request() req: any,
    @Body() dto: CreateGoalDto,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const goal = await this.goalService.create(userId, dto);
    return {
      success: true,
      data: goal,
      message: 'Goal created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('goals/:id')
  @ApiOperation({ summary: 'Update a goal' })
  async updateGoal(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const updated = await this.goalService.update(userId, id, dto);
    return {
      success: true,
      data: updated,
      message: 'Goal updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('goals/:id/milestones/:msId/toggle')
  @ApiOperation({ summary: 'Toggle milestone completion and recalculate progress' })
  async toggleMilestone(
    @Request() req: any,
    @Param('id') id: string,
    @Param('msId') msId: string,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const goal = await this.goalService.toggleMilestone(userId, id, msId);
    return {
      success: true,
      data: goal,
      message: 'Milestone updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('goals/:id')
  @ApiOperation({ summary: 'Delete a goal' })
  async deleteGoal(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<StandardApiResponse<any>> {
    const userId = req.user.userId;
    const result = await this.goalService.delete(userId, id);
    return {
      success: true,
      data: result,
      message: 'Goal deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
