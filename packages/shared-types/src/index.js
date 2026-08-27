"use strict";
/**
 * LifeOS — Shared Domain Types & Auth DTO Contracts
 * (REQ-AUTH & REQ-USER Shared Definitions)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileVisibility = exports.UserThemePreference = exports.UserRole = void 0;
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
