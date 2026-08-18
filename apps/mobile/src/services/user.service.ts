import { apiClient } from './api';
import {
  UserAccountSnapshot,
  UserProfile,
  UserSettings,
  UserPrivacySettings,
  StandardApiResponse,
} from '@lifeos/shared-types';

export const userService = {
  async getAccountSnapshot(): Promise<UserAccountSnapshot> {
    const response = await apiClient.get<StandardApiResponse<UserAccountSnapshot>>('/users/me');
    return response.data.data!;
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.patch<StandardApiResponse<UserProfile>>('/users/me/profile', data);
    return response.data.data!;
  },

  async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    const response = await apiClient.patch<StandardApiResponse<UserSettings>>('/users/me/settings', data);
    return response.data.data!;
  },

  async updatePrivacy(data: Partial<UserPrivacySettings>): Promise<UserPrivacySettings> {
    const response = await apiClient.patch<StandardApiResponse<UserPrivacySettings>>('/users/me/privacy', data);
    return response.data.data!;
  },

  async exportUserData(): Promise<UserAccountSnapshot> {
    const response = await apiClient.get<StandardApiResponse<UserAccountSnapshot>>('/users/me/export');
    return response.data.data!;
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete('/users/me');
  },
};
