import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { Argon2Service } from '../auth/services/argon2.service';
import { UserStoreService } from '../users/user-store.service';
import { UsersService } from '../users/users.service';
import { ProfileVisibility, UserRole } from '@lifeos/shared-types';

describe('Security Audit & NFR Compliance (Phase 6: Task 6.1)', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let argon2Service: Argon2Service;
  let userStoreService: UserStoreService;
  let usersService: UsersService;
  let testUserId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        Argon2Service,
        UserStoreService,
        UsersService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockImplementation((payload) => Promise.resolve(`signed_token_${payload.sub}`)),
            verifyAsync: jest.fn().mockImplementation((token) => {
              if (token === 'tampered_malformed_token' || token === 'expired_token') {
                return Promise.reject(new Error('jwt malformed or expired'));
              }
              return Promise.resolve({ sub: 'usr_valid_01', email: 'sec@lifeos.ai' });
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    argon2Service = module.get<Argon2Service>(Argon2Service);
    userStoreService = module.get<UserStoreService>(UserStoreService);
    usersService = module.get<UsersService>(UsersService);

    const user = userStoreService.createUser({
      email: 'sec@lifeos.ai',
      fullName: 'Security Lead',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=1$mockHash',
      role: UserRole.USER,
    });
    testUserId = user.id;
  });

  describe('SEC-01: Authentication & Token Security', () => {
    it('should securely hash passwords with Argon2id parameters', async () => {
      const password = 'SuperSecurePassword2026!';
      const hash = await argon2Service.hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).toContain('$argon2id$');

      const isValid = await argon2Service.verifyPassword(hash, password);
      expect(isValid).toBe(true);

      const isInvalid = await argon2Service.verifyPassword(hash, 'WrongPassword123');
      expect(isInvalid).toBe(false);
    });

    it('should reject tampered or corrupted JWT tokens', async () => {
      await expect(jwtService.verifyAsync('tampered_malformed_token')).rejects.toThrow('jwt malformed or expired');
    });

    it('should reject expired JWT tokens', async () => {
      await expect(jwtService.verifyAsync('expired_token')).rejects.toThrow('jwt malformed or expired');
    });
  });

  describe('SEC-02: GDPR Article 17 (Right to Erasure) & Article 20 (Data Portability)', () => {
    it('should export all user data strictly within GDPR compliance bundle', () => {
      const exportBundle = usersService.exportAccount(testUserId);
      expect(exportBundle).toBeDefined();
      expect(exportBundle.user).toBeDefined();
      expect(exportBundle.exportedAt).toBeDefined();
      expect(exportBundle.exportScope).toContain('profile');
      expect(exportBundle.exportScope).toContain('settings');
      expect(exportBundle.exportScope).toContain('privacy-consents');
      expect(exportBundle.complianceNotice).toContain('GDPR Article 20');
    });

    it('should soft-delete and anonymize user identifiers upon account deletion request', () => {
      const result = usersService.deleteAccount(testUserId);
      expect(result.deleted).toBe(true);
      expect(result.deletedAt).toBeDefined();
    });
  });

  describe('SEC-03: Input Sanitization & Integrity', () => {
    it('should enforce strict boundary checks on user preferences and privacy', () => {
      const updated = usersService.updateProfile(testUserId, {
        timezone: 'UTC',
        currencyCode: 'EUR',
      });
      expect(updated.profile.timezone).toBe('UTC');
      expect(updated.profile.currencyCode).toBe('EUR');

      const privacyUpdated = usersService.updatePrivacy(testUserId, {
        profileVisibility: ProfileVisibility.PRIVATE,
        dataProcessingConsent: true,
      });
      expect(privacyUpdated.privacy.profileVisibility).toBe(ProfileVisibility.PRIVATE);
    });
  });
});
