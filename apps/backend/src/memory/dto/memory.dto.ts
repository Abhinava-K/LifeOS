import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MemoryCategory } from '@lifeos/shared-types';

export class CreateMemoryRequestDto {
  @ApiProperty({ description: 'Text content of the memory' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ enum: MemoryCategory, default: MemoryCategory.FACT })
  @IsOptional()
  @IsEnum(MemoryCategory)
  category?: MemoryCategory;

  @ApiPropertyOptional({ description: 'Importance rating from 1 to 10', minimum: 1, maximum: 10, default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  importance?: number;

  @ApiPropertyOptional({ description: 'Associated tags', type: [String] })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Arbitrary metadata map' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class RecallMemoryRequestDto {
  @ApiProperty({ description: 'Semantic recall query or current prompt' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: 'Minimum importance filter (1-10)', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  minImportance?: number;

  @ApiPropertyOptional({ description: 'Maximum number of items to recall', default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ enum: MemoryCategory, isArray: true })
  @IsOptional()
  categories?: MemoryCategory[];
}

export class QueryMemoriesRequestDto {
  @ApiPropertyOptional({ enum: MemoryCategory })
  @IsOptional()
  @IsEnum(MemoryCategory)
  category?: MemoryCategory;

  @ApiPropertyOptional({ description: 'Keyword filter' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Minimum importance' })
  @IsOptional()
  @IsNumber()
  minImportance?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  offset?: number;
}
