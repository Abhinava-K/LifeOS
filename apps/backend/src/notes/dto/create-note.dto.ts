import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ description: 'Title of the note', example: 'Lecture Notes: Operating Systems' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Markdown body content of the note', example: '# OS Memory Layout\nVirtual memory uses paging...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Custom tags associated with the note', example: ['cs101', 'exam', 'memory'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Linked note titles or wikilinks [[Target]]', example: ['Paging', 'TLB'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  wikilinks?: string[];

  @ApiPropertyOptional({ description: 'Pin status of the note', example: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
