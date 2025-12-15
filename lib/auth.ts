import bcrypt from 'bcryptjs';

const PLACEHOLDER_ADMIN_HASH = 'your_bcrypt_hashed_password';

export async function verifyPassword(password: string): Promise<boolean> {
  const hashedPassword = process.env.ADMIN_PASSWORD_HASH?.trim();
  const isPlaceholder = !hashedPassword || hashedPassword === PLACEHOLDER_ADMIN_HASH;
  
  if (isPlaceholder) {
    // For development only - allow 'Admin123' as default password
    // Using a pre-generated hash to ensure consistency
    if (process.env.NODE_ENV !== 'production') {
      const defaultHash = '$2a$10$m2JUQ2M68OnAnqHFQanwGOj/j57bhdy/5YphNdQxuZ0aioeJlIAA6';
      return bcrypt.compare(password, defaultHash);
    }
    throw new Error('ADMIN_PASSWORD_HASH must be set in production');
  }
  
  return bcrypt.compare(password, hashedPassword);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
