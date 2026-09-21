import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateNoteDto {
  @ApiPropertyOptional({ description: 'Title of the note', example: 'Updated Lecture Notes' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Markdown body content of the note' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Custom tags associated with the note' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Linked note titles or wikilinks [[Target]]' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  wikilinks?: string[];

  @ApiPropertyOptional({ description: 'Pin status of the note' })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
