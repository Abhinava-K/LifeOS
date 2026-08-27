"use strict";
/**
 * LifeOS — Shared Domain Types & Contract Interfaces
 * (REQ-AUTH, REQ-USER, REQ-DB, REQ-PLAN, REQ-NOTE, REQ-EXP, REQ-MEM)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseCategory = exports.TaskStatus = exports.TaskPriority = exports.ProfileVisibility = exports.UserThemePreference = exports.UserRole = void 0;
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
// ─── Domain Models (Tasks, Notes, Expenses, Habits, Calendar, AI) ───
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
