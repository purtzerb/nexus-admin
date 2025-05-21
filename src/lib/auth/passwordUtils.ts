import crypto from 'crypto';

/**
 * Generate a random salt for password hashing
 * @returns A random salt string
 */
export const generateSalt = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Hash a password with a salt
 * @param password The plain text password
 * @param salt The salt to use for hashing
 * @returns The hashed password
 */
export const hashPassword = (password: string, salt: string): string => {
  return crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
};

/**
 * Generate a salt and hash a password
 * @param password The plain text password
 * @returns An object containing the salt and hashed password
 */
export const generatePasswordHash = (password: string): { passwordHash: string; passwordSalt: string } => {
  const salt = generateSalt();
  const hash = hashPassword(password, salt);
  return {
    passwordHash: hash,
    passwordSalt: salt
  };
};

/**
 * Verify a password against a hash and salt
 * @param password The plain text password to verify
 * @param hash The stored hash to compare against
 * @param salt The salt used to create the hash
 * @returns True if the password matches, false otherwise
 */
export const verifyPassword = (password: string, hash: string, salt: string): boolean => {
  const passwordHash = hashPassword(password, salt);
  return passwordHash === hash;
};
