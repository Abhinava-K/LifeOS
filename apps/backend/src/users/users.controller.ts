import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserPayload } from '@lifeos/shared-types';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UsersService } from './users.service';

@ApiTags('User Management & Settings (REQ-USER)')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the current authenticated user profile and settings' })
  async getCurrentUser(@Req() req: Request) {
    const user = (req as any).user as UserPayload;
    const data = this.usersService.getCurrentUser(user?.userId);

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update profile details and personal information' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Req() req: Request, @Body() updateProfileDto: UpdateProfileDto) {
    const user = (req as any).user as UserPayload;
    const data = this.usersService.updateProfile(user?.userId, updateProfileDto);

    return {
      success: true,
      message: 'Profile updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('me/settings')
  @ApiOperation({ summary: 'Update user preferences and application settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateSettings(@Req() req: Request, @Body() updateSettingsDto: UpdateSettingsDto) {
    const user = (req as any).user as UserPayload;
    const data = this.usersService.updateSettings(user?.userId, updateSettingsDto);

    return {
      success: true,
      message: 'Settings updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('me/privacy')
  @ApiOperation({ summary: 'Update GDPR consent and privacy preferences' })
  @ApiResponse({ status: 200, description: 'Privacy preferences updated successfully' })
  async updatePrivacy(@Req() req: Request, @Body() updatePrivacyDto: UpdatePrivacyDto) {
    const user = (req as any).user as UserPayload;
    const data = this.usersService.updatePrivacy(user?.userId, updatePrivacyDto);

    return {
      success: true,
      message: 'Privacy preferences updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('me/export')
  @ApiOperation({ summary: 'Export user data for GDPR portability requests' })
  async exportAccount(@Req() req: Request) {
    const user = (req as any).user as UserPayload;
    const data = this.usersService.exportAccount(user?.userId);

    return {
      success: true,
      message: 'User data exported successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete the user account and revoke access' })
  async deleteAccount(@Req() req: Request) {
    const user = (req as any).user as UserPayload;
    const data = this.usersService.deleteAccount(user?.userId);

    return {
      success: true,
      message: 'User account deleted successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}