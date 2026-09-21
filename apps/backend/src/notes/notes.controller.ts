import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserPayload } from '@lifeos/shared-types';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateNoteDto } from './dto/create-note.dto';
import { QueryNotesDto } from './dto/query-notes.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesService } from './notes.service';

@ApiTags('Notes Vault & Knowledge Base (REQ-NOTE)')
@Controller('notes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Markdown note & generate 1536-dim vector embedding (REQ-NOTE-1, REQ-NOTE-3)' })
  @ApiResponse({ status: 201, description: 'Note created successfully' })
  async createNote(@Req() req: Request, @Body() createNoteDto: CreateNoteDto) {
    const user = (req as any).user as UserPayload;
    const data = await this.notesService.createNote(user?.userId || 'usr_demo_123', createNoteDto);

    return {
      success: true,
      message: 'Note created successfully and indexed into Knowledge Vault',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated notes list with search and tag filters' })
  async findAll(@Req() req: Request, @Query() query: QueryNotesDto) {
    const user = (req as any).user as UserPayload;
    const result = await this.notesService.findAll(user?.userId || 'usr_demo_123', query);

    return {
      success: true,
      data: result.items,
      meta: {
        total: result.total,
        offset: query.offset || 0,
        limit: query.limit || 20,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('graph/wikilinks')
  @ApiOperation({ summary: 'Get Knowledge Base wikilink graph nodes and edge links' })
  async getWikiGraph(@Req() req: Request) {
    const user = (req as any).user as UserPayload;
    const data = await this.notesService.getWikiGraph(user?.userId || 'usr_demo_123');

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single note by ID' })
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = (req as any).user as UserPayload;
    const data = await this.notesService.findOne(user?.userId || 'usr_demo_123', id);

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update note content, title, tags, or pinned status' })
  async updateNote(@Req() req: Request, @Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    const user = (req as any).user as UserPayload;
    const data = await this.notesService.updateNote(user?.userId || 'usr_demo_123', id, updateNoteDto);

    return {
      success: true,
      message: 'Note updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a note record and purge vector index' })
  async deleteNote(@Req() req: Request, @Param('id') id: string) {
    const user = (req as any).user as UserPayload;
    const data = await this.notesService.deleteNote(user?.userId || 'usr_demo_123', id);

    return {
      success: true,
      message: 'Note deleted successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/summarize')
  @ApiOperation({ summary: 'Force AI 3-bullet summary generation for a note (REQ-NOTE-2)' })
  async summarizeNote(@Req() req: Request, @Param('id') id: string) {
    const user = (req as any).user as UserPayload;
    const data = await this.notesService.summarizeNote(user?.userId || 'usr_demo_123', id);

    return {
      success: true,
      message: 'AI 3-bullet summary generated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
