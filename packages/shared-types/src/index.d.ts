/**
 * LifeOS — Shared Domain Types & Contract Interfaces
 * (REQ-AUTH, REQ-USER, REQ-DB, REQ-PLAN, REQ-NOTE, REQ-EXP, REQ-MEM)
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
export declare enum TaskPriority {
    URGENT_IMPORTANT = "URGENT_IMPORTANT",
    NOT_URGENT_IMPORTANT = "NOT_URGENT_IMPORTANT",
    URGENT_NOT_IMPORTANT = "URGENT_NOT_IMPORTANT",
    NOT_URGENT_NOT_IMPORTANT = "NOT_URGENT_NOT_IMPORTANT"
}
export declare enum TaskStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export interface TaskDto {
    id: string;
    userId: string;
    title: string;
    description?: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string | null;
    completedAt?: string | null;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}
export interface NoteDto {
    id: string;
    userId: string;
    title: string;
    content: string;
    tags: string[];
    wikilinks: string[];
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare enum ExpenseCategory {
    FOOD_DINING = "FOOD_DINING",
    GROCERIES = "GROCERIES",
    TRANSPORTATION = "TRANSPORTATION",
    HOUSING_BILLS = "HOUSING_BILLS",
    ENTERTAINMENT = "ENTERTAINMENT",
    HEALTH_FITNESS = "HEALTH_FITNESS",
    EDUCATION_STUDY = "EDUCATION_STUDY",
    TECH_SOFTWARE = "TECH_SOFTWARE",
    MISCELLANEOUS = "MISCELLANEOUS"
}
export interface ExpenseDto {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    category: ExpenseCategory;
    merchant: string;
    description?: string | null;
    receiptUrl?: string | null;
    ocrRawText?: string | null;
    date: string;
    createdAt: string;
    updatedAt: string;
}
export interface HabitDto {
    id: string;
    userId: string;
    title: string;
    frequency: string;
    targetDaysPerWeek: number;
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate?: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface CalendarEventDto {
    id: string;
    userId: string;
    title: string;
    description?: string | null;
    location?: string | null;
    startTime: string;
    endTime: string;
    isAllDay: boolean;
    isGoogleSync: boolean;
    googleEventId?: string | null;
}
export interface DailyBriefingDto {
    date: string;
    greeting: string;
    quote: string;
    scheduledEvents: CalendarEventDto[];
    topTasks: TaskDto[];
    habitSummary: {
        totalHabits: number;
        completedToday: number;
        activeStreak: number;
    };
    budgetSummary: {
        spentThisMonth: number;
        monthlyBudget: number;
        currency: string;
    };
    aiRecommendations: string[];
}
