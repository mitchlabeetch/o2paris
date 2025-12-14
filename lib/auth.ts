import bcrypt from 'bcryptjs';

export async function verifyPassword(password: string): Promise<boolean> {
  const hashedPassword = process.env.ADMIN_PASSWORD_HASH;
  
  if (!hashedPassword) {
    // For development only - allow 'Admin123' as default password
    // Using a pre-generated hash to ensure consistency
    if (process.env.NODE_ENV !== 'production') {
      const defaultHash = '$2a$10$9ZfwyQCLtC0TFNHksZwpyuPPX7KIMhEUGhSg/rEhEAUwcCeTSmuBq';
      return bcrypt.compare(password, defaultHash);
    }
    throw new Error('ADMIN_PASSWORD_HASH must be set in production');
  }
  
  return bcrypt.compare(password, hashedPassword);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
