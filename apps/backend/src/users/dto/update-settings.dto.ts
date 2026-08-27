import { ApiPropertyOptional } from '@nestjs/swagger';
import { CalendarViewMode, UserThemePreference } from '@lifeos/shared-types';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ enum: UserThemePreference, description: 'Visual theme preference' })
  @IsOptional()
  @IsEnum(UserThemePreference)
  theme?: UserThemePreference;

  @ApiPropertyOptional({ example: 'en-US', description: 'Preferred language' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Enable email notifications' })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable push notifications' })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable daily digest emails' })
  @IsOptional()
  @IsBoolean()
  dailyDigest?: boolean;

  @ApiPropertyOptional({ example: '08:00', description: 'Daily briefing notification time (HH:mm)' })
  @IsOptional()
  @IsString()
  notificationSchedule?: string;

  @ApiPropertyOptional({ example: 'MONTH', description: 'Default calendar view mode' })
  @IsOptional()
  @IsString()
  defaultCalendarView?: CalendarViewMode;
}