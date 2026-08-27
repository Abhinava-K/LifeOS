import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GoogleLoginDto, AppleLoginDto } from './dto/oauth-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Authentication Engine (REQ-AUTH)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user account (REQ-AUTH-1)' })
  @ApiResponse({ status: 201, description: 'User account created successfully' })
  @ApiResponse({ status: 400, description: 'User already exists or validation error' })
  async register(@Body() registerDto: RegisterDto) {
    const data = await this.authService.register(registerDto);
    return {
      success: true,
      message: 'Account registered successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user & issue dual tokens (REQ-AUTH-2)' })
  @ApiResponse({ status: 200, description: 'Authenticated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);
    return {
      success: true,
      message: 'Authenticated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate via Google OAuth2 ID Token (REQ-AUTH-4)' })
  @ApiResponse({ status: 200, description: 'Authenticated via Google OAuth successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired Google token' })
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    const data = await this.authService.googleLogin(googleLoginDto);
    return {
      success: true,
      message: 'Google authentication successful',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('apple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate via Apple Sign-In Identity Token (REQ-AUTH-5)' })
  @ApiResponse({ status: 200, description: 'Authenticated via Apple Sign-In successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired Apple token' })
  async appleLogin(@Body() appleLoginDto: AppleLoginDto) {
    const data = await this.authService.appleLogin(appleLoginDto);
    return {
      success: true,
      message: 'Apple authentication successful',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate and refresh JWT access token (REQ-AUTH-3)' })
  @ApiResponse({ status: 200, description: 'Tokens rotated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or revoked refresh token' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    const data = await this.authService.refreshTokens('', refreshTokenDto.refreshToken);
    return {
      success: true,
      message: 'Access token refreshed successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user & revoke refresh token' })
  async logout(@Req() req: Request) {
    const user = (req as any).user;
    await this.authService.logout(user?.userId);
    return {
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async getProfile(@Req() req: Request) {
    return {
      success: true,
      data: (req as any).user,
      timestamp: new Date().toISOString(),
    };
  }
}
