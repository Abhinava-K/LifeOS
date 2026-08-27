import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto, AppleLoginDto } from './dto/oauth-login.dto';
import { UserRole } from '@lifeos/shared-types';

describe('AuthController (Phase 2 Unit Tests)', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthResponse = {
    user: {
      userId: 'usr_mock_123',
      email: 'mock@lifeos.internal',
      fullName: 'Mock User',
      role: UserRole.USER,
    },
    tokens: {
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      expiresIn: 900,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(mockAuthResponse),
            login: jest.fn().mockResolvedValue(mockAuthResponse),
            googleLogin: jest.fn().mockResolvedValue(mockAuthResponse),
            appleLogin: jest.fn().mockResolvedValue(mockAuthResponse),
            refreshTokens: jest.fn().mockResolvedValue(mockAuthResponse),
            logout: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn().mockResolvedValue({ userId: 'usr_mock_123' }),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register endpoint', () => {
    it('should return wrapped success response on registration', async () => {
      const dto: RegisterDto = {
        email: 'mock@lifeos.internal',
        password: 'Password123!',
        fullName: 'Mock User',
      };

      const result = await authController.register(dto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthResponse);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login endpoint', () => {
    it('should return wrapped success response on login', async () => {
      const dto: LoginDto = {
        email: 'mock@lifeos.internal',
        password: 'Password123!',
      };

      const result = await authController.login(dto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('OAuth endpoints', () => {
    it('should call googleLogin service on POST /auth/google', async () => {
      const dto: GoogleLoginDto = { idToken: 'google_id_token' };
      const result = await authController.googleLogin(dto);
      expect(result.success).toBe(true);
      expect(authService.googleLogin).toHaveBeenCalledWith(dto);
    });

    it('should call appleLogin service on POST /auth/apple', async () => {
      const dto: AppleLoginDto = { idToken: 'apple_id_token' };
      const result = await authController.appleLogin(dto);
      expect(result.success).toBe(true);
      expect(authService.appleLogin).toHaveBeenCalledWith(dto);
    });
  });
});
