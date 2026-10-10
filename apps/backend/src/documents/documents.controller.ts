import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DocumentDto, StandardApiResponse, UploadDocumentDto } from '@lifeos/shared-types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';

@Controller('api/v1/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  getDocuments(): StandardApiResponse<DocumentDto[]> {
    const userId = 'usr_default_01';
    const docs = this.documentsService.getUserDocuments(userId);
    return {
      success: true,
      data: docs,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('search')
  searchDocuments(@Query('q') query: string): StandardApiResponse<DocumentDto[]> {
    const userId = 'usr_default_01';
    const results = this.documentsService.searchDocuments(userId, query || '');
    return {
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  getDocumentById(@Param('id') id: string): StandardApiResponse<DocumentDto> {
    const userId = 'usr_default_01';
    const doc = this.documentsService.getDocumentById(userId, id);
    return {
      success: true,
      data: doc,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  uploadDocument(@Body() input: UploadDocumentDto): StandardApiResponse<DocumentDto> {
    const userId = 'usr_default_01';
    const doc = this.documentsService.uploadDocument(userId, input);
    return {
      success: true,
      data: doc,
      message: 'Document uploaded and indexed successfully into Vault',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  deleteDocument(@Param('id') id: string): StandardApiResponse<{ deleted: boolean }> {
    const userId = 'usr_default_01';
    const deleted = this.documentsService.deleteDocument(userId, id);
    return {
      success: true,
      data: { deleted },
      message: 'Document removed from vault',
      timestamp: new Date().toISOString(),
    };
  }
}
