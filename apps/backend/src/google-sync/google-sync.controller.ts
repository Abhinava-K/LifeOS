import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserPayload } from '@lifeos/shared-types';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GoogleConnectRequestDto, GoogleSyncTriggerDto } from './dto/google-sync.dto';
import { GoogleSyncService } from './google-sync.service';

@ApiTags('Google Workspace Integration (REQ-GGL)')
@Controller('google')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoogleSyncController {
  constructor(private readonly googleSyncService: GoogleSyncService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get current Google Workspace OAuth connection status and enabled services' })
  @ApiResponse({ status: 200, description: 'Google connection status retrieved' })
  async getStatus(@Req() req: Request) {
    const user = (req as any).user as UserPayload;
    const userId = user?.userId || 'usr_demo_123';
    const data = await this.googleSyncService.getConnectionStatus(userId);

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('connect')
  @ApiOperation({ summary: 'Link Google account with OAuth2 authorization code or token' })
  @ApiResponse({ status: 200, description: 'Google Workspace linked successfully' })
  async connect(@Req() req: Request, @Body() dto: GoogleConnectRequestDto) {
    const user = (req as any).user as UserPayload;
    const userId = user?.userId || 'usr_demo_123';
    const data = await this.googleSyncService.connect(userId, dto);

    return {
      success: true,
      message: 'Google Workspace account linked successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger bi-directional sync (Calendar, Gmail tasks, Drive files, Contacts)' })
  @ApiResponse({ status: 200, description: 'Sync completed successfully' })
  async triggerSync(@Req() req: Request, @Body() dto: GoogleSyncTriggerDto) {
    const user = (req as any).user as UserPayload;
    const userId = user?.userId || 'usr_demo_123';
    const data = await this.googleSyncService.triggerSync(userId, dto);

    return {
      success: true,
      message: data.message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('logs')
  @ApiOperation({ summary: 'Retrieve recent Google Workspace sync audit logs' })
  async getLogs(@Req() req: Request) {
    const user = (req as any).user as UserPayload;
    const userId = user?.userId || 'usr_demo_123';
    const data = await this.googleSyncService.getLogs(userId);

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('disconnect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke Google tokens and unlink Google Workspace' })
  async disconnect(@Req() req: Request) {
    const user = (req as any).user as UserPayload;
    const userId = user?.userId || 'usr_demo_123';
    await this.googleSyncService.disconnect(userId);

    return {
      success: true,
      message: 'Google Workspace disconnected and tokens revoked',
      timestamp: new Date().toISOString(),
    };
  }
}
