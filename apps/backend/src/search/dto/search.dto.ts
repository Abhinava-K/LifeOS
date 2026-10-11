import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SearchEntityType } from '@lifeos/shared-types';

export class SearchQueryRequestDto {
  @ApiProperty({ description: 'Search keywords or natural language query' })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    enum: SearchEntityType,
    isArray: true,
    description: 'Filter search by entity types (NOTE, TASK, EVENT, EXPENSE, DOCUMENT, FLASHCARD)',
  })
  @IsOptional()
  @IsArray()
  types?: SearchEntityType[];

  @ApiPropertyOptional({ description: 'Max number of results to return', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Pagination offset', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ description: 'Minimum RRF fusion score threshold', default: 0.001 })
  @IsOptional()
  @IsNumber()
  minScore?: number;

  @ApiPropertyOptional({ description: 'RRF constant k (default 60)', default: 60 })
  @IsOptional()
  @IsNumber()
  rrfConstant?: number;
}
