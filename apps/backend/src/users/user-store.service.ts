import { Injectable } from '@nestjs/common';
import {
  CalendarViewMode,
  GdprExportBundle,
  ProfileVisibility,
  UserAccountSnapshot,
  UserPayload,
  UserPrivacySettings,
  UserRole,
  UserSettings,
  UserThemePreference,
} from '@lifeos/shared-types';

export interface StoredUser {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  role: UserRole;
  refreshTokenHash?: string;
  avatarUrl: string | null;
  bio: string | null;
  phoneNumber: string | null;
  locale: string;
  timezone: string;
  currencyCode: string;
  settings: UserSettings;
  privacy: UserPrivacySettings;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateUserInput {
  email: string;
  fullName: string;
  passwordHash: string;
  role: UserRole;
}

export interface UpdateProfileInput {
  fullName?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  phoneNumber?: string | null;
  locale?: string;
  timezone?: string;
  currencyCode?: string;
}

export interface UpdateSettingsInput {
  theme?: UserThemePreference;
  language?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  dailyDigest?: boolean;
  notificationSchedule?: string;
  defaultCalendarView?: CalendarViewMode;
}

export interface UpdatePrivacyInput {
  profileVisibility?: ProfileVisibility;
  dataProcessingConsent?: boolean;
  marketingConsent?: boolean;
  analyticsConsent?: boolean;
}

@Injectable()
export class UserStoreService {
  private readonly users: StoredUser[] = [];

  findById(userId: string): StoredUser | undefined {
    return this.users.find((user) => user.id === userId && !user.deletedAt);
  }

  findByEmail(email: string): StoredUser | undefined {
    return this.users.find((user) => user.email === email && !user.deletedAt);
  }

  createUser(input: CreateUserInput): StoredUser {
    const now = new Date().toISOString();
    const userId = `usr_${Date.now()}`;

    const storedUser: StoredUser = {
      id: userId,
      email: input.email,
      fullName: input.fullName,
      passwordHash: input.passwordHash,
      role: input.role,
      refreshTokenHash: undefined,
      avatarUrl: null,
      bio: null,
      phoneNumber: null,
      locale: 'en-US',
      timezone: 'UTC',
      currencyCode: 'USD',
      settings: {
        theme: UserThemePreference.SYSTEM,
        language: 'en-US',
        emailNotifications: true,
        pushNotifications: true,
        dailyDigest: false,
        notificationSchedule: '08:00',
        defaultCalendarView: 'MONTH',
      },
      privacy: {
        profileVisibility: ProfileVisibility.PRIVATE,
        dataProcessingConsent: true,
        marketingConsent: false,
        analyticsConsent: false,
        updatedAt: now,
      },
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    this.users.push(storedUser);
    return storedUser;
  }

  updateRefreshToken(userId: string, refreshTokenHash: string | undefined): void {
    const user = this.findById(userId);
    if (!user) {
      return;
    }

    user.refreshTokenHash = refreshTokenHash;
    user.updatedAt = new Date().toISOString();
  }

  updateProfile(userId: string, input: UpdateProfileInput): StoredUser | undefined {
    const user = this.findById(userId);
    if (!user) {
      return undefined;
    }

    if (typeof input.fullName === 'string') {
      user.fullName = input.fullName;
    }
    if (input.avatarUrl !== undefined) {
      user.avatarUrl = input.avatarUrl;
    }
    if (input.bio !== undefined) {
      user.bio = input.bio;
    }
    if (input.phoneNumber !== undefined) {
      user.phoneNumber = input.phoneNumber;
    }
    if (typeof input.locale === 'string') {
      user.locale = input.locale;
      user.settings.language = input.locale;
    }
    if (typeof input.timezone === 'string') {
      user.timezone = input.timezone;
    }
    if (typeof input.currencyCode === 'string') {
      user.currencyCode = input.currencyCode;
    }

    user.updatedAt = new Date().toISOString();
    return user;
  }

  updateSettings(userId: string, input: UpdateSettingsInput): StoredUser | undefined {
    const user = this.findById(userId);
    if (!user) {
      return undefined;
    }

    if (input.theme) {
      user.settings.theme = input.theme;
    }
    if (typeof input.language === 'string') {
      user.settings.language = input.language;
      user.locale = input.language;
    }
    if (typeof input.emailNotifications === 'boolean') {
      user.settings.emailNotifications = input.emailNotifications;
    }
    if (typeof input.pushNotifications === 'boolean') {
      user.settings.pushNotifications = input.pushNotifications;
    }
    if (typeof input.dailyDigest === 'boolean') {
      user.settings.dailyDigest = input.dailyDigest;
    }
    if (typeof input.notificationSchedule === 'string') {
      user.settings.notificationSchedule = input.notificationSchedule;
    }
    if (input.defaultCalendarView) {
      user.settings.defaultCalendarView = input.defaultCalendarView;
    }

    user.updatedAt = new Date().toISOString();
    return user;
  }

  updatePrivacy(userId: string, input: UpdatePrivacyInput): StoredUser | undefined {
    const user = this.findById(userId);
    if (!user) {
      return undefined;
    }

    const now = new Date().toISOString();
    if (input.profileVisibility) {
      user.privacy.profileVisibility = input.profileVisibility;
    }
    if (typeof input.dataProcessingConsent === 'boolean') {
      user.privacy.dataProcessingConsent = input.dataProcessingConsent;
    }
    if (typeof input.marketingConsent === 'boolean') {
      user.privacy.marketingConsent = input.marketingConsent;
    }
    if (typeof input.analyticsConsent === 'boolean') {
      user.privacy.analyticsConsent = input.analyticsConsent;
    }

    user.privacy.updatedAt = now;
    user.updatedAt = now;
    return user;
  }

  revokeRefreshToken(userId: string): void {
    this.updateRefreshToken(userId, undefined);
  }

  softDelete(userId: string): boolean {
    const user = this.findById(userId);
    if (!user) {
      return false;
    }

    const now = new Date().toISOString();
    user.deletedAt = now;
    user.refreshTokenHash = undefined;
    user.email = `deleted_${user.id}@anonymized.local`;
    user.fullName = 'Deleted User';
    user.avatarUrl = null;
    user.bio = null;
    user.phoneNumber = null;
    user.privacy.dataProcessingConsent = false;
    user.privacy.marketingConsent = false;
    user.privacy.analyticsConsent = false;
    user.privacy.updatedAt = now;
    user.updatedAt = now;
    return true;
  }

  toPayload(user: StoredUser): UserPayload {
    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }

  toSnapshot(user: StoredUser): UserAccountSnapshot {
    return {
      profile: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        locale: user.locale,
        timezone: user.timezone,
        currencyCode: user.currencyCode,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      settings: { ...user.settings },
      privacy: { ...user.privacy },
    };
  }

  exportUserData(userId: string): GdprExportBundle | undefined {
    const user = this.findById(userId);
    if (!user) {
      return undefined;
    }

    return {
      user: this.toSnapshot(user),
      exportedAt: new Date().toISOString(),
      exportScope: ['profile', 'settings', 'privacy-consents', 'activity-ledger'],
      complianceNotice: 'Generated pursuant to EU GDPR Article 20 Right to Data Portability.',
    };
  }
}