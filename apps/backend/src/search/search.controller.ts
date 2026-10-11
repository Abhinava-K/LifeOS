import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchEntityType, UserPayload } from '@lifeos/shared-types';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchQueryRequestDto } from './dto/search.dto';
import { SearchService } from './search.service';

@ApiTags('Universal Hybrid Search (REQ-SRCH)')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Quick keyword search across all notes, tasks, calendar, expenses, docs & flashcards' })
  @ApiResponse({ status: 200, description: 'Aggregated search results returned' })
  async simpleSearch(
    @Req() req: Request,
    @Query('q') query: string,
    @Query('types') types?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const user = (req as any).user as UserPayload;
    const userId = user?.userId || 'usr_demo_123';

    let parsedTypes: SearchEntityType[] | undefined;
    if (types) {
      parsedTypes = types.split(',').map((t) => t.trim().toUpperCase() as SearchEntityType);
    }

    const data = await this.searchService.hybridSearch(userId, {
      query: query || '',
      types: parsedTypes,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
    });

    return {
      success: true,
      message: `Universal search matched ${data.totalMatches} items across LifeOS subsystems`,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('hybrid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reciprocal Rank Fusion (RRF) hybrid keyword + vector semantic search' })
  @ApiResponse({ status: 200, description: 'RRF ranked search results returned' })
  async hybridSearch(@Req() req: Request, @Body() dto: SearchQueryRequestDto) {
    const user = (req as any).user as UserPayload;
    const userId = user?.userId || 'usr_demo_123';

    const data = await this.searchService.hybridSearch(userId, dto);

    return {
      success: true,
      message: `Hybrid RRF search completed in ${data.executionTimeMs}ms (${data.totalMatches} matches)`,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
