import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProfileVisibility, UserRole, UserThemePreference } from '@lifeos/shared-types';
import { UserStoreService } from './user-store.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let userStoreService: UserStoreService;

  beforeEach(() => {
    userStoreService = new UserStoreService();
    usersService = new UsersService(userStoreService);
  });

  it('should retrieve current user snapshot', () => {
    const user = userStoreService.createUser({
      email: 'user@example.com',
      fullName: 'John Doe',
      passwordHash: 'hash',
      role: UserRole.USER,
    });

    const snapshot = usersService.getCurrentUser(user.id);
    expect(snapshot.profile.userId).toBe(user.id);
    expect(snapshot.profile.email).toBe('user@example.com');
    expect(snapshot.profile.fullName).toBe('John Doe');
  });

  it('should throw NotFoundException if user does not exist when getting user profile', () => {
    expect(() => usersService.getCurrentUser('non_existent')).toThrow(NotFoundException);
  });

  it('should update user profile via service', () => {
    const user = userStoreService.createUser({
      email: 'user2@example.com',
      fullName: 'Jane Doe',
      passwordHash: 'hash',
      role: UserRole.USER,
    });

    const updated = usersService.updateProfile(user.id, { fullName: 'Jane Smith' });
    expect(updated.profile.fullName).toBe('Jane Smith');
  });

  it('should update user settings via service', () => {
    const user = userStoreService.createUser({
      email: 'user3@example.com',
      fullName: 'User Three',
      passwordHash: 'hash',
      role: UserRole.USER,
    });

    const updated = usersService.updateSettings(user.id, { theme: UserThemePreference.DARK });
    expect(updated.settings.theme).toBe(UserThemePreference.DARK);
  });

  it('should update user privacy via service', () => {
    const user = userStoreService.createUser({
      email: 'user4@example.com',
      fullName: 'User Four',
      passwordHash: 'hash',
      role: UserRole.USER,
    });

    const updated = usersService.updatePrivacy(user.id, {
      profileVisibility: ProfileVisibility.PUBLIC,
    });
    expect(updated.privacy.profileVisibility).toBe(ProfileVisibility.PUBLIC);
  });

  it('should export account data for GDPR portability', () => {
    const user = userStoreService.createUser({
      email: 'export@example.com',
      fullName: 'Export User',
      passwordHash: 'hash',
      role: UserRole.USER,
    });

    const result = usersService.exportAccount(user.id);
    expect(result.user.profile.userId).toBe(user.id);
    expect(result.exportedAt).toBeDefined();
    expect(result.exportScope).toContain('profile');
    expect(result.exportScope).toContain('settings');
    expect(result.exportScope).toContain('privacy-consents');
  });

  it('should delete user account and anonymize PII for GDPR erasure', () => {
    const user = userStoreService.createUser({
      email: 'delete@example.com',
      fullName: 'Delete User',
      passwordHash: 'hash',
      role: UserRole.USER,
    });

    const result = usersService.deleteAccount(user.id);
    expect(result.deleted).toBe(true);
    expect(result.deletedAt).toBeDefined();

    expect(() => usersService.getCurrentUser(user.id)).toThrow(NotFoundException);
  });

  it('should throw BadRequestException when deleting non-existent account', () => {
    expect(() => usersService.deleteAccount('non_existent')).toThrow(BadRequestException);
  });
});
