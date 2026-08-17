import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse, UserPayload, UserRole } from '@lifeos/shared-types';
import { Argon2Service } from './services/argon2.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserStoreService } from '../users/user-store.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly argon2Service: Argon2Service,
    private readonly userStore: UserStoreService,
  ) {}

  /**
   * Register a new user account with Argon2id password hashing (REQ-AUTH-1)
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = this.userStore.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await this.argon2Service.hashPassword(registerDto.password);
    const newUser = this.userStore.createUser({
      email: registerDto.email,
      fullName: registerDto.fullName,
      passwordHash,
      role: UserRole.USER,
    });

    const tokens = await this.generateTokens(
      newUser.id,
      newUser.email,
      newUser.fullName,
      newUser.role,
    );
    this.userStore.updateRefreshToken(
      newUser.id,
      await this.argon2Service.hashPassword(tokens.refreshToken),
    );

    return {
      user: {
        userId: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      },
      tokens,
    };
  }

  /**
   * Authenticate user credentials & issue JWT dual tokens (REQ-AUTH-2)
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = this.userStore.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    const isPasswordValid = await this.argon2Service.verifyPassword(
      user.passwordHash,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.fullName, user.role);
    this.userStore.updateRefreshToken(
      user.id,
      await this.argon2Service.hashPassword(tokens.refreshToken),
    );

    return {
      user: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      tokens,
    };
  }

  /**
   * Rotate and refresh access token using valid refresh token (REQ-AUTH-3)
   */
  async refreshTokens(userId: string, refreshToken: string): Promise<AuthResponse> {
    const user = this.userStore.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Access denied. Invalid session token');
    }

    const refreshTokenMatches = await this.argon2Service.verifyPassword(
      user.refreshTokenHash,
      refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Refresh token is invalid or has been revoked');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.fullName, user.role);
    this.userStore.updateRefreshToken(
      user.id,
      await this.argon2Service.hashPassword(tokens.refreshToken),
    );

    return {
      user: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      tokens,
    };
  }

  /**
   * Logout user & revoke active refresh token
   */
  async logout(userId: string): Promise<boolean> {
    this.userStore.revokeRefreshToken(userId);
    return true;
  }

  /**
   * Generate dual-token pair (Access Token 15m + Refresh Token 7d)
   */
  private async generateTokens(userId: string, email: string, fullName: string, role: UserRole) {
    const payload: UserPayload = { userId, email, fullName, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'lifeos_jwt_secret_key_2026',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'lifeos_refresh_secret_key_2026',
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
