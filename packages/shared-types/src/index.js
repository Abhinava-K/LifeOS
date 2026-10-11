"use strict";
/**
 * LifeOS — Shared Domain Types & Contract Interfaces
 * (REQ-AUTH, REQ-USER, REQ-DB, REQ-PLAN, REQ-NOTE, REQ-EXP, REQ-MEM)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSyncStatus = exports.GoogleServiceType = exports.SearchEntityType = exports.MemoryCategory = exports.ExpenseCategory = exports.GoalCategory = exports.TaskStatus = exports.TaskPriority = exports.ProfileVisibility = exports.UserThemePreference = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["PREMIUM"] = "PREMIUM";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserThemePreference;
(function (UserThemePreference) {
    UserThemePreference["LIGHT"] = "LIGHT";
    UserThemePreference["DARK"] = "DARK";
    UserThemePreference["SYSTEM"] = "SYSTEM";
})(UserThemePreference || (exports.UserThemePreference = UserThemePreference = {}));
var ProfileVisibility;
(function (ProfileVisibility) {
    ProfileVisibility["PUBLIC"] = "PUBLIC";
    ProfileVisibility["PRIVATE"] = "PRIVATE";
})(ProfileVisibility || (exports.ProfileVisibility = ProfileVisibility = {}));
// ─── Domain Models (Tasks, Notes, Expenses, Habits, Calendar, Goals, AI) ───
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["URGENT_IMPORTANT"] = "URGENT_IMPORTANT";
    TaskPriority["NOT_URGENT_IMPORTANT"] = "NOT_URGENT_IMPORTANT";
    TaskPriority["URGENT_NOT_IMPORTANT"] = "URGENT_NOT_IMPORTANT";
    TaskPriority["NOT_URGENT_NOT_IMPORTANT"] = "NOT_URGENT_NOT_IMPORTANT";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "TODO";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["CANCELLED"] = "CANCELLED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var GoalCategory;
(function (GoalCategory) {
    GoalCategory["CAREER_STUDY"] = "CAREER_STUDY";
    GoalCategory["HEALTH_FITNESS"] = "HEALTH_FITNESS";
    GoalCategory["FINANCE"] = "FINANCE";
    GoalCategory["PERSONAL_GROWTH"] = "PERSONAL_GROWTH";
})(GoalCategory || (exports.GoalCategory = GoalCategory = {}));
var ExpenseCategory;
(function (ExpenseCategory) {
    ExpenseCategory["FOOD_DINING"] = "FOOD_DINING";
    ExpenseCategory["GROCERIES"] = "GROCERIES";
    ExpenseCategory["TRANSPORTATION"] = "TRANSPORTATION";
    ExpenseCategory["HOUSING_BILLS"] = "HOUSING_BILLS";
    ExpenseCategory["ENTERTAINMENT"] = "ENTERTAINMENT";
    ExpenseCategory["HEALTH_FITNESS"] = "HEALTH_FITNESS";
    ExpenseCategory["EDUCATION_STUDY"] = "EDUCATION_STUDY";
    ExpenseCategory["TECH_SOFTWARE"] = "TECH_SOFTWARE";
    ExpenseCategory["MISCELLANEOUS"] = "MISCELLANEOUS";
})(ExpenseCategory || (exports.ExpenseCategory = ExpenseCategory = {}));
// ==========================================
// Phase 5: Long-Term Memory Subsystem (REQ-MEM)
// ==========================================
var MemoryCategory;
(function (MemoryCategory) {
    MemoryCategory["FACT"] = "FACT";
    MemoryCategory["PREFERENCE"] = "PREFERENCE";
    MemoryCategory["EPISODIC"] = "EPISODIC";
    MemoryCategory["GOAL"] = "GOAL";
    MemoryCategory["INTERACTION"] = "INTERACTION";
})(MemoryCategory || (exports.MemoryCategory = MemoryCategory = {}));
// ==========================================
// Phase 5: Universal Hybrid Search (REQ-SRCH)
// ==========================================
var SearchEntityType;
(function (SearchEntityType) {
    SearchEntityType["NOTE"] = "NOTE";
    SearchEntityType["TASK"] = "TASK";
    SearchEntityType["EVENT"] = "EVENT";
    SearchEntityType["EXPENSE"] = "EXPENSE";
    SearchEntityType["DOCUMENT"] = "DOCUMENT";
    SearchEntityType["FLASHCARD"] = "FLASHCARD";
})(SearchEntityType || (exports.SearchEntityType = SearchEntityType = {}));
// ==========================================
// Phase 5: Google Workspace Integration (REQ-GGL)
// ==========================================
var GoogleServiceType;
(function (GoogleServiceType) {
    GoogleServiceType["CALENDAR"] = "CALENDAR";
    GoogleServiceType["GMAIL"] = "GMAIL";
    GoogleServiceType["DRIVE"] = "DRIVE";
    GoogleServiceType["CONTACTS"] = "CONTACTS";
})(GoogleServiceType || (exports.GoogleServiceType = GoogleServiceType = {}));
var GoogleSyncStatus;
(function (GoogleSyncStatus) {
    GoogleSyncStatus["CONNECTED"] = "CONNECTED";
    GoogleSyncStatus["DISCONNECTED"] = "DISCONNECTED";
    GoogleSyncStatus["SYNCING"] = "SYNCING";
    GoogleSyncStatus["ERROR"] = "ERROR";
})(GoogleSyncStatus || (exports.GoogleSyncStatus = GoogleSyncStatus = {}));
