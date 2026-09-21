import { Module } from '@nestjs/common';
import { PlannerController } from './planner.controller';
import { TaskService } from './services/task.service';
import { CalendarEngineService } from './services/calendar-engine.service';
import { HabitEngineService } from './services/habit-engine.service';
import { GoalService } from './services/goal.service';
import { NotificationSchedulerService } from './services/notification-scheduler.service';

@Module({
  controllers: [PlannerController],
  providers: [
    TaskService,
    CalendarEngineService,
    HabitEngineService,
    GoalService,
    NotificationSchedulerService,
  ],
  exports: [
    TaskService,
    CalendarEngineService,
    HabitEngineService,
    GoalService,
    NotificationSchedulerService,
  ],
})
export class PlannerModule {}
