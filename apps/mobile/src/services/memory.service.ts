import { apiClient } from './api';
import {
  CreateMemoryDto,
  MemoryItemDto,
  MemoryRecallResultDto,
  MemoryStatsDto,
  RecallMemoryDto,
} from '@lifeos/shared-types';

export const memoryService = {
  async getMemories(search?: string, minImportance?: number): Promise<{ items: MemoryItemDto[]; total: number }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (minImportance) params.append('minImportance', String(minImportance));

    const response = await apiClient.get(`/memory?${params.toString()}`);
    return { items: response.data.data, total: response.data.meta.total };
  },

  async recall(dto: RecallMemoryDto): Promise<MemoryRecallResultDto> {
    const response = await apiClient.post('/memory/recall', dto);
    return response.data.data;
  },

  async getStats(): Promise<MemoryStatsDto> {
    const response = await apiClient.get('/memory/stats');
    return response.data.data;
  },

  async create(dto: CreateMemoryDto): Promise<MemoryItemDto> {
    const response = await apiClient.post('/memory', dto);
    return response.data.data;
  },

  async delete(id: string): Promise<boolean> {
    const response = await apiClient.delete(`/memory/${id}`);
    return response.data.success;
  },
};
