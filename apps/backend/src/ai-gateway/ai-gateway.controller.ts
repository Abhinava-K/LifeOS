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
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgentDispatchDto } from './dto/agent-dispatch.dto';
import { ChatPromptDto } from './dto/chat-prompt.dto';
import { AiRouterService } from './services/ai-router.service';
import { SessionManagerService } from './services/session-manager.service';

@ApiTags('AI Gateway & Multi-Agent Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiGatewayController {
  constructor(
    private readonly aiRouterService: AiRouterService,
    private readonly sessionManager: SessionManagerService,
  ) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send prompt to AI Gateway (Multi-provider routing with fallback)',
    description: 'Routes prompt to Gemini, Groq, or OpenAI based on availability and request parameters.',
  })
  @ApiResponse({ status: 200, description: 'AI completion result successfully returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access token missing or invalid.' })
  async chatCompletion(@Req() req: any, @Body() dto: ChatPromptDto) {
    const userId = req.user?.sub || req.user?.userId || 'usr_anonymous';
    return this.aiRouterService.executeCompletion(userId, dto);
  }

  @Sse('chat/stream')
  @ApiOperation({
    summary: 'Stream AI completion tokens via Server-Sent Events (SSE)',
    description: 'Establishes SSE connection streaming text tokens in real time.',
  })
  @ApiResponse({ status: 200, description: 'Real-time text token stream.' })
  streamChat(@Req() req: any, @Query() query: ChatPromptDto): Observable<{ data: string }> {
    const userId = req.user?.sub || req.user?.userId || 'usr_anonymous';
    return this.aiRouterService.streamCompletion(userId, query);
  }

  @Post('agents/dispatch')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Dispatch complex task to Python CrewAI Multi-Agent microservice',
    description: 'Queues multi-agent planning/research task to Parth agent execution engine.',
  })
  @ApiResponse({ status: 202, description: 'Task accepted and queued for agent dispatch.' })
  async dispatchAgent(@Req() req: any, @Body() dto: AgentDispatchDto) {
    const userId = req.user?.sub || req.user?.userId || 'usr_anonymous';
    return this.aiRouterService.dispatchAgentTask(userId, dto);
  }

  @Get('providers')
  @ApiOperation({ summary: 'List available LLM providers and model statuses' })
  @ApiResponse({ status: 200, description: 'List of configured AI providers.' })
  getProviders() {
    return {
      timestamp: new Date().toISOString(),
      providers: this.aiRouterService.getAvailableProviders(),
    };
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get active conversation history for a chat session' })
  @ApiParam({ name: 'sessionId', example: 'sess_123456' })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async getSessionHistory(
    @Req() req: any,
    @Param('sessionId') sessionId: string,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user?.sub || req.user?.userId || 'usr_anonymous';
    const limitNum = limit ? Number(limit) : 20;
    const history = await this.sessionManager.getSessionHistory(userId, sessionId, limitNum);
    return {
      sessionId,
      count: history.length,
      history,
    };
  }

  @Delete('sessions/:sessionId')
  @ApiOperation({ summary: 'Clear chat session history' })
  @ApiParam({ name: 'sessionId', example: 'sess_123456' })
  async clearSession(@Req() req: any, @Param('sessionId') sessionId: string) {
    const userId = req.user?.sub || req.user?.userId || 'usr_anonymous';
    const cleared = await this.sessionManager.clearSession(userId, sessionId);
    return {
      sessionId,
      cleared,
      message: cleared ? 'Session history deleted' : 'Session not found or already deleted',
    };
  }
}
