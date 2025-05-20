/**
 * Authentication constants
 */
export const AUTH_URL = 'https://app.usebraintrust.com/api/user/login/';
export const LOCAL_AUTH_ENABLED = true; // Enable local authentication with passwordHash/passwordSalt

/**
 * Cookie constants
 */
export const AUTH_COOKIE_NAME = 'auth-token';
export const AUTH_COOKIE_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * User roles
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  SOLUTIONS_ENGINEER = 'SOLUTIONS_ENGINEER',
  CLIENT_USER = 'CLIENT_USER'
}