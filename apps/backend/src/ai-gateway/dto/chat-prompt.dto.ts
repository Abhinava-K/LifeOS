import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export enum LlmProvider {
  GEMINI = 'gemini',
  GROQ = 'groq',
  OPENAI = 'openai',
  AUTO = 'auto',
}

export class ChatPromptDto {
  @ApiProperty({
    description: 'The user prompt message to send to the AI provider',
    example: 'Summarize my schedule for today and list top 3 priority tasks.',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'Session identifier for maintaining multi-turn chat history',
    example: 'sess_987654321',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({
    enum: LlmProvider,
    default: LlmProvider.AUTO,
    description: 'Target LLM Provider (auto routes dynamically with failover)',
  })
  @IsOptional()
  @IsEnum(LlmProvider)
  provider?: LlmProvider = LlmProvider.AUTO;

  @ApiPropertyOptional({
    description: 'Specific model name override (e.g. gemini-1.5-pro, llama-3.3-70b)',
    example: 'gemini-1.5-pro',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'System prompt instructions to override or augment agent personality',
  })
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ApiPropertyOptional({
    description: 'Sampling temperature for randomness (0.0 to 1.0)',
    default: 0.7,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number = 0.7;
}
