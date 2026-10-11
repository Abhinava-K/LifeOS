import { apiClient } from './api';
import {
  HybridSearchResponseDto,
  SearchEntityType,
  SearchQueryDto,
} from '@lifeos/shared-types';

export const searchService = {
  async quickSearch(
    query: string,
    types?: SearchEntityType[],
    limit = 20,
    offset = 0,
  ): Promise<HybridSearchResponseDto> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (types && types.length > 0) params.append('types', types.join(','));
    params.append('limit', String(limit));
    params.append('offset', String(offset));

    const response = await apiClient.get(`/search?${params.toString()}`);
    return response.data.data;
  },

  async hybridSearch(dto: SearchQueryDto): Promise<HybridSearchResponseDto> {
    const response = await apiClient.post('/search/hybrid', dto);
    return response.data.data;
  },
};
