import { ProfileVisibility, UserRole, UserThemePreference } from '@lifeos/shared-types';
import { UserStoreService } from './user-store.service';

describe('UserStoreService', () => {
  let userStoreService: UserStoreService;

  beforeEach(() => {
    userStoreService = new UserStoreService();
  });

  it('should create a new user with default preferences', () => {
    const user = userStoreService.createUser({
      email: 'parth@example.com',
      fullName: 'Parth P',
      passwordHash: 'hashed_password',
      role: UserRole.USER,
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('parth@example.com');
    expect(user.fullName).toBe('Parth P');
    expect(user.role).toBe(UserRole.USER);
    expect(user.settings.theme).toBe(UserThemePreference.SYSTEM);
    expect(user.privacy.profileVisibility).toBe(ProfileVisibility.PRIVATE);
    expect(user.deletedAt).toBeNull();
  });

  it('should find user by id and email', () => {
    const created = userStoreService.createUser({
      email: 'test@example.com',
      fullName: 'Test User',
      passwordHash: 'secret',
      role: UserRole.USER,
    });

    expect(userStoreService.findById(created.id)).toEqual(created);
    expect(userStoreService.findByEmail('test@example.com')).toEqual(created);
  });

  it('should update profile info correctly', () => {
    const created = userStoreService.createUser({
      email: 'profile@example.com',
      fullName: 'Initial Name',
      passwordHash: 'secret',
      role: UserRole.USER,
    });

    const updated = userStoreService.updateProfile(created.id, {
      fullName: 'Updated Name',
      bio: 'New Bio',
      phoneNumber: '+1234567890',
      locale: 'en-GB',
      timezone: 'Europe/London',
    });

    expect(updated).toBeDefined();
    expect(updated?.fullName).toBe('Updated Name');
    expect(updated?.bio).toBe('New Bio');
    expect(updated?.phoneNumber).toBe('+1234567890');
    expect(updated?.locale).toBe('en-GB');
    expect(updated?.timezone).toBe('Europe/London');
    expect(updated?.settings.language).toBe('en-GB');
  });

  it('should update settings preferences correctly', () => {
    const created = userStoreService.createUser({
      email: 'settings@example.com',
      fullName: 'Settings User',
      passwordHash: 'secret',
      role: UserRole.USER,
    });

    const updated = userStoreService.updateSettings(created.id, {
      theme: UserThemePreference.DARK,
      emailNotifications: false,
      pushNotifications: true,
      dailyDigest: true,
    });

    expect(updated).toBeDefined();
    expect(updated?.settings.theme).toBe(UserThemePreference.DARK);
    expect(updated?.settings.emailNotifications).toBe(false);
    expect(updated?.settings.pushNotifications).toBe(true);
    expect(updated?.settings.dailyDigest).toBe(true);
  });

  it('should update privacy settings correctly', () => {
    const created = userStoreService.createUser({
      email: 'privacy@example.com',
      fullName: 'Privacy User',
      passwordHash: 'secret',
      role: UserRole.USER,
    });

    const updated = userStoreService.updatePrivacy(created.id, {
      profileVisibility: ProfileVisibility.PUBLIC,
      marketingConsent: true,
      analyticsConsent: true,
    });

    expect(updated).toBeDefined();
    expect(updated?.privacy.profileVisibility).toBe(ProfileVisibility.PUBLIC);
    expect(updated?.privacy.marketingConsent).toBe(true);
    expect(updated?.privacy.analyticsConsent).toBe(true);
  });

  it('should soft delete user and anonymize PII for GDPR right to erasure', () => {
    const created = userStoreService.createUser({
      email: 'delete@example.com',
      fullName: 'Delete Me',
      passwordHash: 'secret',
      role: UserRole.USER,
    });

    const success = userStoreService.softDelete(created.id);
    expect(success).toBe(true);

    // Searching active user returns undefined
    expect(userStoreService.findById(created.id)).toBeUndefined();
    expect(userStoreService.findByEmail('delete@example.com')).toBeUndefined();

    // Verify PII is anonymized on stored instance
    expect(created.deletedAt).not.toBeNull();
    expect(created.email).toBe(`deleted_${created.id}@anonymized.local`);
    expect(created.fullName).toBe('Deleted User');
    expect(created.bio).toBeNull();
    expect(created.phoneNumber).toBeNull();
    expect(created.privacy.marketingConsent).toBe(false);
  });

  it('should export user data correctly', () => {
    const created = userStoreService.createUser({
      email: 'export@example.com',
      fullName: 'Export User',
      passwordHash: 'secret',
      role: UserRole.USER,
    });

    const exportData = userStoreService.exportUserData(created.id);
    expect(exportData).toBeDefined();
    expect(exportData?.profile.email).toBe('export@example.com');
    expect(exportData?.profile.fullName).toBe('Export User');
    expect(exportData?.settings).toBeDefined();
    expect(exportData?.privacy).toBeDefined();
  });
});
