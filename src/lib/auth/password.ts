import crypto from 'crypto';

/**
 * Generates a random salt for password hashing
 * @returns {string} A random salt string
 */
export function generatePasswordSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Hashes a password with the provided salt
 * @param {string} password - The plain text password
 * @param {string} salt - The salt to use for hashing
 * @returns {Promise<string>} The hashed password
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex'));
    });
  });
}

/**
 * Verifies a password against a stored hash and salt
 * @param {string} password - The plain text password to verify
 * @param {string} hash - The stored password hash
 * @param {string} salt - The stored salt
 * @returns {Promise<boolean>} True if the password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const passwordHash = await hashPassword(password, salt);
  return passwordHash === hash;
}
