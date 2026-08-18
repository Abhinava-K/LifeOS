import { apiClient } from './api';
import {
  LoginRequestDto,
  RegisterRequestDto,
  AuthResponse,
  StandardApiResponse,
} from '@lifeos/shared-types';

export const authService = {
  async register(data: RegisterRequestDto): Promise<AuthResponse> {
    const response = await apiClient.post<StandardApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data!;
  },

  async login(data: LoginRequestDto): Promise<AuthResponse> {
    const response = await apiClient.post<StandardApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data!;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
