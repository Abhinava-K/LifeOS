/**
 * LifeOS — Shared Domain Types & Auth DTO Contracts
 * (REQ-AUTH & REQ-USER Shared Definitions)
 */

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  PREMIUM = 'PREMIUM'
}

export interface UserPayload {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: UserPayload;
  tokens: Tokens;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface GoogleOAuthRequestDto {
  idToken: string;
  provider: 'google';
}

export interface StandardApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}
