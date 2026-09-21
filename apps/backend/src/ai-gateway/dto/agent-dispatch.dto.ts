import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class AgentDispatchDto {
  @ApiProperty({
    description: 'High-level task description for the multi-agent system to execute',
    example: 'Analyze monthly expenses and generate a budget optimization report.',
  })
  @IsString()
  task: string;

  @ApiPropertyOptional({
    description: 'Specific target agent role (e.g. planner, financial_analyst, research_assistant)',
    example: 'financial_analyst',
  })
  @IsOptional()
  @IsString()
  agentRole?: string;

  @ApiPropertyOptional({
    description: 'Additional contextual parameters or metadata for the agent workflow',
    example: { month: '2026-08', currency: 'USD' },
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}
