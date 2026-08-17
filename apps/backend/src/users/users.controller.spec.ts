import { Test, TestingModule } from '@nestjs/testing';
import { ProfileVisibility, UserRole, UserThemePreference } from '@lifeos/shared-types';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserStoreService } from './user-store.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let userStoreService: UserStoreService;
  let userId: string;

  beforeEach(async () => {
    userStoreService = new UserStoreService();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: UserStoreService,
          useValue: userStoreService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);

    const user = userStoreService.createUser({
      email: 'parth@example.com',
      fullName: 'Parth P',
      passwordHash: 'hashed_password',
      role: UserRole.USER,
    });
    userId = user.id;
  });

  const mockRequest = (uId: string) =>
    ({
      user: { userId: uId },
    }) as unknown as Request;

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return current user profile on GET /users/me', async () => {
    const response = await controller.getCurrentUser(mockRequest(userId));
    expect(response.success).toBe(true);
    expect(response.data.profile.userId).toBe(userId);
    expect(response.data.profile.email).toBe('parth@example.com');
  });

  it('should update profile details on PATCH /users/me/profile', async () => {
    const response = await controller.updateProfile(mockRequest(userId), {
      fullName: 'Parth Patel',
      bio: 'Building LifeOS',
    });
    expect(response.success).toBe(true);
    expect(response.message).toBe('Profile updated successfully');
    expect(response.data.profile.fullName).toBe('Parth Patel');
    expect(response.data.profile.bio).toBe('Building LifeOS');
  });

  it('should update settings on PATCH /users/me/settings', async () => {
    const response = await controller.updateSettings(mockRequest(userId), {
      theme: UserThemePreference.DARK,
      emailNotifications: false,
    });
    expect(response.success).toBe(true);
    expect(response.message).toBe('Settings updated successfully');
    expect(response.data.settings.theme).toBe(UserThemePreference.DARK);
    expect(response.data.settings.emailNotifications).toBe(false);
  });

  it('should update privacy settings on PATCH /users/me/privacy', async () => {
    const response = await controller.updatePrivacy(mockRequest(userId), {
      profileVisibility: ProfileVisibility.PUBLIC,
      analyticsConsent: true,
    });
    expect(response.success).toBe(true);
    expect(response.message).toBe('Privacy preferences updated successfully');
    expect(response.data.privacy.profileVisibility).toBe(ProfileVisibility.PUBLIC);
    expect(response.data.privacy.analyticsConsent).toBe(true);
  });

  it('should export user data on GET /users/me/export for GDPR compliance', async () => {
    const response = await controller.exportAccount(mockRequest(userId));
    expect(response.success).toBe(true);
    expect(response.message).toBe('User data exported successfully');
    expect(response.data.user.profile.userId).toBe(userId);
    expect(response.data.exportScope).toBeDefined();
  });

  it('should delete user account on DELETE /users/me for GDPR erasure', async () => {
    const response = await controller.deleteAccount(mockRequest(userId));
    expect(response.success).toBe(true);
    expect(response.message).toBe('User account deleted successfully');
    expect(response.data.deleted).toBe(true);
  });
});
