import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Argon2Service } from './services/argon2.service';
import { UserStoreService } from '../users/user-store.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto, AppleLoginDto } from './dto/oauth-login.dto';

describe('AuthService (Phase 2 Unit Tests)', () => {
  let authService: AuthService;
  let userStoreService: UserStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        Argon2Service,
        UserStoreService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mocked_jwt_token_xyz'),
            verify: jest.fn().mockReturnValue({ userId: 'usr_test_123' }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userStoreService = module.get<UserStoreService>(UserStoreService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully and return dual tokens', async () => {
      const dto: RegisterDto = {
        email: 'newuser@lifeos.internal',
        password: 'Password123!',
        fullName: 'New LifeOS User',
      };

      const response = await authService.register(dto);

      expect(response.user).toBeDefined();
      expect(response.user.email).toBe(dto.email);
      expect(response.tokens.accessToken).toBe('mocked_jwt_token_xyz');
      expect(response.tokens.refreshToken).toBe('mocked_jwt_token_xyz');
    });

    it('should throw BadRequestException if user email already exists', async () => {
      const dto: RegisterDto = {
        email: 'duplicate@lifeos.internal',
        password: 'Password123!',
        fullName: 'Duplicate User',
      };

      await authService.register(dto);
      await expect(authService.register(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should authenticate valid credentials and issue tokens', async () => {
      const email = 'loginuser@lifeos.internal';
      const password = 'Password123!';

      await authService.register({ email, password, fullName: 'Login Test' });

      const loginDto: LoginDto = { email, password };
      const response = await authService.login(loginDto);

      expect(response.user.email).toBe(email);
      expect(response.tokens.accessToken).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid email or password', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@lifeos.internal',
        password: 'WrongPassword!',
      };

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('OAuth Handlers', () => {
    it('should authenticate Google OAuth user', async () => {
      const googleDto: GoogleLoginDto = {
        idToken: 'mock_google_id_token_123',
        fullName: 'Google User',
      };

      const response = await authService.googleLogin(googleDto);
      expect(response.user.email).toContain('google_');
      expect(response.tokens.accessToken).toBe('mocked_jwt_token_xyz');
    });

    it('should authenticate Apple Sign-In user', async () => {
      const appleDto: AppleLoginDto = {
        idToken: 'mock_apple_id_token_123',
        fullName: 'Apple User',
      };

      const response = await authService.appleLogin(appleDto);
      expect(response.user.email).toContain('apple_');
      expect(response.tokens.accessToken).toBe('mocked_jwt_token_xyz');
    });
  });

  describe('logout', () => {
    it('should revoke user refresh token on logout', async () => {
      const email = 'logoutuser@lifeos.internal';
      const res = await authService.register({
        email,
        password: 'Password123!',
        fullName: 'Logout User',
      });

      const logoutResult = await authService.logout(res.user.userId);
      expect(logoutResult).toBe(true);
    });
  });
});
