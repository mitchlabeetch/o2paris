import bcrypt from 'bcryptjs';

export async function verifyPassword(password: string): Promise<boolean> {
  const hashedPassword = process.env.ADMIN_PASSWORD_HASH;
  
  if (!hashedPassword) {
    // For development, allow 'admin123' as default password
    const defaultHash = await bcrypt.hash('admin123', 10);
    return bcrypt.compare(password, defaultHash);
  }
  
  return bcrypt.compare(password, hashedPassword);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
