/**
 * LifeOS — Shared Domain Types & Auth DTO Contracts
 * (REQ-AUTH & REQ-USER Shared Definitions)
 */
export declare enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN",
    PREMIUM = "PREMIUM"
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
export declare enum UserThemePreference {
    LIGHT = "LIGHT",
    DARK = "DARK",
    SYSTEM = "SYSTEM"
}
export declare enum ProfileVisibility {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE"
}
export interface UserProfile {
    userId: string;
    email: string;
    fullName: string;
    role: UserRole;
    avatarUrl: string | null;
    bio: string | null;
    phoneNumber: string | null;
    locale: string;
    timezone: string;
    createdAt: string;
    updatedAt: string;
}
export interface UserSettings {
    theme: UserThemePreference;
    language: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    dailyDigest: boolean;
}
export interface UserPrivacySettings {
    profileVisibility: ProfileVisibility;
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
    analyticsConsent: boolean;
}
export interface UserAccountSnapshot {
    profile: UserProfile;
    settings: UserSettings;
    privacy: UserPrivacySettings;
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
