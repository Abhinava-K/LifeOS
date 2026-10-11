import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserPayload } from '@lifeos/shared-types';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMemoryRequestDto, QueryMemoriesRequestDto, RecallMemoryRequestDto } from './dto/memory.dto';
import { MemoryService } from './services/memory.service';

@ApiTags('Long-Term Memory Subsystem (REQ-MEM)')
@Controller('memory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new long-term memory item with 768-dim embedding' })
  @ApiResponse({ status: 201, description: 'Memory created successfully' })
  async createMemory(@Req() req: Request, @Body() dto: CreateMemoryRequestDto) {
    const user = (req as any).user as UserPayload;
    const userId = user?.userId || 'usr_demo_123';
    const data = await this.memoryService.createMemory(userId, dto);

    return {
      success: true,
      message: 'Memory saved and vectorized for semantic recall',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'List stored long-term memories with category and keyword filters' })
  async getMemories(@Req() req: Request, @Query() query: QueryMemoriesRequestDto) {
    const user = (req as any).user as UserPayload;
    const userId = user?.userId || 'usr_demo_123';
    const result = await this.memoryService.getMemories(userId, query);

    return {
      success: true,
      data: result.items,
      meta: {
        total: result.total,
        offset: query.offset || 0,
        limit: query.limit || 50,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('recall')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Semantic vector recall of memories for AI prompt context' })
  async recallMemories(@Req() req: Request, @Body() dto: RecallMemoryRequestDto) {
    const user = (req as any).user as UserPayload;
    const userId = user?.userId || 'usr_demo_123';
    const data = await this.memoryService.recallMemories(userId, dto);

    return {
      success: true,
      message: `Recalled ${data.totalFound} relevant long-term memory items`,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get memory storage and usage analytics' })
  async getStats(@Req() req: Request) {
    const user = (req as any).user as UserPayload;
    const userId = user?.userId || 'usr_demo_123';
    const data = await this.memoryService.getStats(userId);

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific memory item by ID' })
  async getMemoryById(@Req() req: Request, @Param('id') id: string) {
    const user = (req as any).user as UserPayload;
    const userId = user?.userId || 'usr_demo_123';
    const data = await this.memoryService.getMemoryById(userId, id);

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a memory item' })
  async updateMemory(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: Partial<CreateMemoryRequestDto>,
  ) {
    const user = (req as any).user as UserPayload;
    const userId = user?.userId || 'usr_demo_123';
    const data = await this.memoryService.updateMemory(userId, id, dto);

    return {
      success: true,
      message: 'Memory updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a memory item' })
  async deleteMemory(@Req() req: Request, @Param('id') id: string) {
    const user = (req as any).user as UserPayload;
    const userId = user?.userId || 'usr_demo_123';
    await this.memoryService.deleteMemory(userId, id);

    return {
      success: true,
      message: 'Memory deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
