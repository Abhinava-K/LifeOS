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
export type CalendarViewMode = 'MONTH' | 'WEEK' | 'DAY';
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
    currencyCode: string;
    createdAt: string;
    updatedAt: string;
}
export interface UserSettings {
    theme: UserThemePreference;
    language: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    dailyDigest: boolean;
    notificationSchedule: string;
    defaultCalendarView: CalendarViewMode;
}
export interface UserPrivacySettings {
    profileVisibility: ProfileVisibility;
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
    analyticsConsent: boolean;
    updatedAt?: string;
}
export interface UserAccountSnapshot {
    profile: UserProfile;
    settings: UserSettings;
    privacy: UserPrivacySettings;
}
export interface GdprExportBundle {
    user: UserAccountSnapshot;
    exportedAt: string;
    exportScope: string[];
    complianceNotice: string;
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
    URGENT_IMPORTANT = "URGENT_IMPORTANT",// Quadrant 1: Do First
    NOT_URGENT_IMPORTANT = "NOT_URGENT_IMPORTANT",// Quadrant 2: Schedule
    URGENT_NOT_IMPORTANT = "URGENT_NOT_IMPORTANT",// Quadrant 3: Delegate
    NOT_URGENT_NOT_IMPORTANT = "NOT_URGENT_NOT_IMPORTANT"
}
export declare enum TaskStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export interface TaskChecklistItem {
    id: string;
    title: string;
    isCompleted: boolean;
}
export interface TaskDto {
    id: string;
    userId: string;
    title: string;
    description?: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string | null;
    estimatedDurationMinutes?: number | null;
    completedAt?: string | null;
    tags: string[];
    checklist?: TaskChecklistItem[];
    createdAt: string;
    updatedAt: string;
}
export interface CreateTaskDto {
    title: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string;
    estimatedDurationMinutes?: number;
    tags?: string[];
    checklist?: {
        title: string;
        isCompleted?: boolean;
    }[];
}
export interface UpdateTaskDto {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string | null;
    estimatedDurationMinutes?: number | null;
    tags?: string[];
    checklist?: TaskChecklistItem[];
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
    categoryColor?: string | null;
    recurrenceRule?: string | null;
    isGoogleSync: boolean;
    googleEventId?: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface CreateCalendarEventDto {
    title: string;
    description?: string;
    location?: string;
    startTime: string;
    endTime: string;
    isAllDay?: boolean;
    categoryColor?: string;
    recurrenceRule?: string;
}
export interface UpdateCalendarEventDto {
    title?: string;
    description?: string;
    location?: string;
    startTime?: string;
    endTime?: string;
    isAllDay?: boolean;
    categoryColor?: string;
    recurrenceRule?: string;
}
export interface EventConflictDto {
    hasConflict: boolean;
    conflictingEvents: CalendarEventDto[];
    overlapMinutes: number;
}
export interface HabitLogDto {
    id: string;
    habitId: string;
    userId: string;
    completedDate: string;
    notes?: string | null;
    createdAt: string;
}
export interface HabitDto {
    id: string;
    userId: string;
    title: string;
    description?: string | null;
    frequency: 'DAILY' | 'WEEKLY' | 'CUSTOM';
    targetDaysPerWeek: number;
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    lastCompletedDate?: string | null;
    categoryColor?: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface CreateHabitDto {
    title: string;
    description?: string;
    frequency?: 'DAILY' | 'WEEKLY' | 'CUSTOM';
    targetDaysPerWeek?: number;
    categoryColor?: string;
}
export interface UpdateHabitDto {
    title?: string;
    description?: string;
    frequency?: 'DAILY' | 'WEEKLY' | 'CUSTOM';
    targetDaysPerWeek?: number;
    categoryColor?: string;
}
export interface HabitAnalyticsDto {
    habitId: string;
    title: string;
    currentStreak: number;
    longestStreak: number;
    completionRateLast30Days: number;
    totalCompletions: number;
    recentLogs: string[];
}
export declare enum GoalCategory {
    CAREER_STUDY = "CAREER_STUDY",
    HEALTH_FITNESS = "HEALTH_FITNESS",
    FINANCE = "FINANCE",
    PERSONAL_GROWTH = "PERSONAL_GROWTH"
}
export interface GoalMilestoneDto {
    id: string;
    title: string;
    isCompleted: boolean;
    dueDate?: string | null;
}
export interface GoalDto {
    id: string;
    userId: string;
    title: string;
    description?: string | null;
    category: GoalCategory;
    targetDate: string;
    progressPercentage: number;
    milestones: GoalMilestoneDto[];
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface CreateGoalDto {
    title: string;
    description?: string;
    category?: GoalCategory;
    targetDate: string;
    progressPercentage?: number;
    milestones?: {
        title: string;
        isCompleted?: boolean;
        dueDate?: string;
    }[];
}
export interface UpdateGoalDto {
    title?: string;
    description?: string;
    category?: GoalCategory;
    targetDate?: string;
    progressPercentage?: number;
    milestones?: GoalMilestoneDto[];
    isArchived?: boolean;
}
export interface NoteDto {
    id: string;
    userId: string;
    title: string;
    content: string;
    summary?: string | null;
    tags: string[];
    wikilinks: string[];
    isPinned: boolean;
    hasEmbedding?: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface CreateNoteDto {
    title: string;
    content: string;
    tags?: string[];
    wikilinks?: string[];
    isPinned?: boolean;
}
export interface UpdateNoteDto {
    title?: string;
    content?: string;
    tags?: string[];
    wikilinks?: string[];
    isPinned?: boolean;
}
export interface QueryNotesDto {
    search?: string;
    tag?: string;
    isPinned?: boolean;
    limit?: number;
    offset?: number;
}
export interface NoteSummaryDto {
    noteId: string;
    summary: string;
    bulletPoints: string[];
    wordCount: number;
}
export interface UniversalSearchResultDto {
    id: string;
    type: 'NOTE' | 'TASK' | 'EVENT' | 'EXPENSE' | 'MEMORY';
    title: string;
    snippet: string;
    score: number;
    metadata?: Record<string, any>;
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
    budgetSummary?: {
        spentThisMonth: number;
        monthlyBudget: number;
        currency: string;
    };
    aiRecommendations: string[];
}
export interface DocumentDto {
    id: string;
    userId: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    sizeBytes: number;
    summary: string | null;
    extractedText?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}
export interface UploadDocumentDto {
    fileName: string;
    fileUrl?: string;
    mimeType: string;
    sizeBytes: number;
    rawText?: string;
    tags?: string[];
    summary?: string;
}
export interface FlashcardDto {
    id: string;
    deckId: string;
    userId: string;
    question: string;
    answer: string;
    explanation?: string | null;
    repetitions: number;
    interval: number;
    easeFactor: number;
    dueDate: string;
    lastReviewedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface FlashcardDeckDto {
    id: string;
    userId: string;
    title: string;
    description?: string | null;
    tags: string[];
    totalCards: number;
    dueCards: number;
    createdAt: string;
    updatedAt: string;
}
export interface CreateFlashcardDeckDto {
    title: string;
    description?: string;
    tags?: string[];
}
export interface CreateFlashcardDto {
    deckId: string;
    question: string;
    answer: string;
    explanation?: string;
}
export interface ReviewFlashcardDto {
    cardId: string;
    recallScore: number;
}
export interface Sm2CalculationResult {
    cardId: string;
    recallScore: number;
    repetitions: number;
    interval: number;
    easeFactor: number;
    dueDate: string;
    nextReviewInDays: number;
}
export interface GenerateFlashcardsDto {
    sourceText: string;
    noteTitle?: string;
    deckTitle?: string;
    cardCount?: number;
}
export interface QuizQuestionDto {
    id: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
}
export interface QuizDto {
    id: string;
    title: string;
    topic: string;
    questions: QuizQuestionDto[];
    totalQuestions: number;
    createdAt: string;
}
export interface SubmitQuizDto {
    quizId: string;
    answers: Record<string, number>;
}
export interface QuizResultDto {
    quizId: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    passed: boolean;
    breakdown: {
        questionId: string;
        question: string;
        selectedOptionIndex: number;
        correctOptionIndex: number;
        isCorrect: boolean;
        explanation: string;
    }[];
}
export declare enum MemoryCategory {
    FACT = "FACT",
    PREFERENCE = "PREFERENCE",
    EPISODIC = "EPISODIC",
    GOAL = "GOAL",
    INTERACTION = "INTERACTION"
}
export interface MemoryItemDto {
    id: string;
    userId: string;
    category: MemoryCategory;
    content: string;
    importance: number;
    accessCount: number;
    lastAccessedAt: string;
    embedding?: number[];
    tags: string[];
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}
export interface CreateMemoryDto {
    category?: MemoryCategory;
    content: string;
    importance?: number;
    tags?: string[];
    metadata?: Record<string, any>;
}
export interface RecallMemoryDto {
    query: string;
    minImportance?: number;
    limit?: number;
    categories?: MemoryCategory[];
}
export interface RecalledMemoryItemDto extends MemoryItemDto {
    similarityScore: number;
    recencyScore: number;
    combinedScore: number;
}
export interface MemoryRecallResultDto {
    query: string;
    totalFound: number;
    memories: RecalledMemoryItemDto[];
    formattedContext: string;
}
export interface MemoryStatsDto {
    totalMemories: number;
    categoryBreakdown: Record<string, number>;
    avgImportance: number;
    mostAccessedMemories: MemoryItemDto[];
}
export declare enum SearchEntityType {
    NOTE = "NOTE",
    TASK = "TASK",
    EVENT = "EVENT",
    EXPENSE = "EXPENSE",
    DOCUMENT = "DOCUMENT",
    FLASHCARD = "FLASHCARD"
}
export interface SearchResultItemDto {
    id: string;
    type: SearchEntityType;
    title: string;
    snippet: string;
    score: number;
    lexicalRank?: number;
    vectorRank?: number;
    rrfScore?: number;
    createdAt?: string;
    urlOrRoute?: string;
    metadata?: Record<string, any>;
}
export interface SearchQueryDto {
    query: string;
    types?: SearchEntityType[];
    limit?: number;
    offset?: number;
    minScore?: number;
    rrfConstant?: number;
}
export interface HybridSearchResponseDto {
    query: string;
    totalMatches: number;
    results: SearchResultItemDto[];
    executionTimeMs: number;
    appliedTypes: SearchEntityType[];
}
export declare enum GoogleServiceType {
    CALENDAR = "CALENDAR",
    GMAIL = "GMAIL",
    DRIVE = "DRIVE",
    CONTACTS = "CONTACTS"
}
export declare enum GoogleSyncStatus {
    CONNECTED = "CONNECTED",
    DISCONNECTED = "DISCONNECTED",
    SYNCING = "SYNCING",
    ERROR = "ERROR"
}
export interface GoogleConnectionStatusDto {
    isConnected: boolean;
    email?: string | null;
    status: GoogleSyncStatus;
    lastSyncAt?: string | null;
    enabledServices: GoogleServiceType[];
    syncErrors?: string[];
}
export interface GoogleConnectDto {
    authCode?: string;
    email?: string;
    scopes?: string[];
}
export interface GoogleSyncRequestDto {
    services?: GoogleServiceType[];
    forceFullSync?: boolean;
}
export interface GoogleSyncResultDto {
    jobId: string;
    status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    syncedItemsCount: {
        calendar: number;
        emails: number;
        drive: number;
        contacts: number;
    };
    timestamp: string;
    durationMs: number;
    message: string;
}
export interface GoogleSyncLogDto {
    id: string;
    timestamp: string;
    service: GoogleServiceType;
    status: 'SUCCESS' | 'FAILED';
    itemsSynced: number;
    details?: string;
}
