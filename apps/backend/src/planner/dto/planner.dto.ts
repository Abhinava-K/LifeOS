import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  GoalCategory,
  TaskPriority,
  TaskStatus,
} from '@lifeos/shared-types';

export class ChecklistItemDto {
  @ApiProperty({ example: 'Gather reference materials' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Finish Chapter 4 Notes' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Review operating systems concepts' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.NOT_URGENT_IMPORTANT })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ example: '2026-09-15T18:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 45, description: 'Duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDurationMinutes?: number;

  @ApiPropertyOptional({ example: ['study', 'os'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [ChecklistItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist?: ChecklistItemDto[];
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Updated Chapter 4 Notes' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated details' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ example: '2026-09-18T18:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDurationMinutes?: number | null;

  @ApiPropertyOptional({ example: ['exam', 'vit'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateCalendarEventDto {
  @ApiProperty({ example: 'Software Engineering Project Review' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Presentation of Phase 4 deliverables' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'SJT 401 / Virtual GMeet' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: '2026-09-14T10:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '2026-09-14T11:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @ApiPropertyOptional({ example: '#6366F1' })
  @IsOptional()
  @IsString()
  categoryColor?: string;

  @ApiPropertyOptional({ example: 'FREQ=WEEKLY;BYDAY=MO' })
  @IsOptional()
  @IsString()
  recurrenceRule?: string;
}

export class UpdateCalendarEventDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recurrenceRule?: string;
}

export class CreateHabitDto {
  @ApiProperty({ example: 'Daily LeetCode & DSA Practice' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Solve at least 2 medium problems' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['DAILY', 'WEEKLY', 'CUSTOM'], default: 'DAILY' })
  @IsOptional()
  @IsEnum(['DAILY', 'WEEKLY', 'CUSTOM'])
  frequency?: 'DAILY' | 'WEEKLY' | 'CUSTOM';

  @ApiPropertyOptional({ example: 7, default: 7 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  targetDaysPerWeek?: number;

  @ApiPropertyOptional({ example: '#10B981' })
  @IsOptional()
  @IsString()
  categoryColor?: string;
}

export class UpdateHabitDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['DAILY', 'WEEKLY', 'CUSTOM'] })
  @IsOptional()
  @IsEnum(['DAILY', 'WEEKLY', 'CUSTOM'])
  frequency?: 'DAILY' | 'WEEKLY' | 'CUSTOM';

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  targetDaysPerWeek?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryColor?: string;
}

export class HabitLogActionDto {
  @ApiPropertyOptional({ example: '2026-09-12' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ example: 'Completed Tree Traversal problems' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class GoalMilestoneInputDto {
  @ApiProperty({ example: 'Complete Backend Unit Test Suite' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({ example: '2026-09-20T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class CreateGoalDto {
  @ApiProperty({ example: 'Master System Design & Microservices' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Build hands-on production level architectures' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: GoalCategory, default: GoalCategory.CAREER_STUDY })
  @IsOptional()
  @IsEnum(GoalCategory)
  category?: GoalCategory;

  @ApiProperty({ example: '2026-11-30T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  targetDate: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercentage?: number;

  @ApiPropertyOptional({ type: [GoalMilestoneInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoalMilestoneInputDto)
  milestones?: GoalMilestoneInputDto[];
}

export class UpdateGoalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: GoalCategory })
  @IsOptional()
  @IsEnum(GoalCategory)
  category?: GoalCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @ApiPropertyOptional({ type: [GoalMilestoneInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoalMilestoneInputDto)
  milestones?: GoalMilestoneInputDto[];
}
