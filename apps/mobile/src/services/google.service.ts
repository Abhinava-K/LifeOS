import { apiClient } from './api';
import {
  GoogleConnectionStatusDto,
  GoogleConnectDto,
  GoogleServiceType,
  GoogleSyncLogDto,
  GoogleSyncResultDto,
} from '@lifeos/shared-types';

export const googleService = {
  async getStatus(): Promise<GoogleConnectionStatusDto> {
    const response = await apiClient.get('/google/status');
    return response.data.data;
  },

  async connect(dto: GoogleConnectDto): Promise<GoogleConnectionStatusDto> {
    const response = await apiClient.post('/google/connect', dto);
    return response.data.data;
  },

  async triggerSync(services?: GoogleServiceType[], forceFullSync = false): Promise<GoogleSyncResultDto> {
    const response = await apiClient.post('/google/sync', { services, forceFullSync });
    return response.data.data;
  },

  async getLogs(): Promise<GoogleSyncLogDto[]> {
    const response = await apiClient.get('/google/logs');
    return response.data.data;
  },

  async disconnect(): Promise<boolean> {
    const response = await apiClient.post('/google/disconnect');
    return response.data.success;
  },
};
