import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GdprExportBundle, UserAccountSnapshot, UserPayload } from '@lifeos/shared-types';
import {
  UpdatePrivacyInput,
  UpdateProfileInput,
  UpdateSettingsInput,
  UserStoreService,
} from './user-store.service';

@Injectable()
export class UsersService {
  constructor(private readonly userStore: UserStoreService) {}

  getCurrentUser(userId: string): UserAccountSnapshot {
    const user = this.userStore.findById(userId);
    if (!user) {
      throw new NotFoundException('User account not found');
    }

    return this.userStore.toSnapshot(user);
  }

  updateProfile(userId: string, input: UpdateProfileInput): UserAccountSnapshot {
    const updatedUser = this.userStore.updateProfile(userId, input);
    if (!updatedUser) {
      throw new NotFoundException('User account not found');
    }

    return this.userStore.toSnapshot(updatedUser);
  }

  updateSettings(userId: string, input: UpdateSettingsInput): UserAccountSnapshot {
    const updatedUser = this.userStore.updateSettings(userId, input);
    if (!updatedUser) {
      throw new NotFoundException('User account not found');
    }

    return this.userStore.toSnapshot(updatedUser);
  }

  updatePrivacy(userId: string, input: UpdatePrivacyInput): UserAccountSnapshot {
    const updatedUser = this.userStore.updatePrivacy(userId, input);
    if (!updatedUser) {
      throw new NotFoundException('User account not found');
    }

    return this.userStore.toSnapshot(updatedUser);
  }

  exportAccount(userId: string): GdprExportBundle {
    const exportBundle = this.userStore.exportUserData(userId);
    if (!exportBundle) {
      throw new NotFoundException('User account not found');
    }

    return exportBundle;
  }

  deleteAccount(userId: string): { deleted: boolean; deletedAt: string } {
    const deleted = this.userStore.softDelete(userId);
    if (!deleted) {
      throw new BadRequestException('User account could not be deleted');
    }

    return {
      deleted: true,
      deletedAt: new Date().toISOString(),
    };
  }

  getUserPayload(userId: string): UserPayload {
    const user = this.userStore.findById(userId);
    if (!user) {
      throw new NotFoundException('User account not found');
    }

    return this.userStore.toPayload(user);
  }
}