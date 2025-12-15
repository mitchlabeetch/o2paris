import bcrypt from 'bcryptjs';

const PLACEHOLDER_ADMIN_HASH = 'your_bcrypt_hashed_password';

export async function verifyPassword(password: string): Promise<boolean> {
  // Trim the input password to avoid issues with copy-pasting whitespace
  const cleanPassword = password.trim();

  const hashedPassword = process.env.ADMIN_PASSWORD_HASH?.trim();
  const isPlaceholder = !hashedPassword || hashedPassword === PLACEHOLDER_ADMIN_HASH;
  
  if (isPlaceholder) {
    console.warn('ADMIN_PASSWORD_HASH is not set or is placeholder. Using default development credentials.');

    // For development only - allow 'Admin123' as default password
    if (process.env.NODE_ENV !== 'production') {
      const defaultHash = '$2a$10$9ZfwyQCLtC0TFNHksZwpyuPPX7KIMhEUGhSg/rEhEAUwcCeTSmuBq';
      return bcrypt.compare(cleanPassword, defaultHash);
    }

    // In production, we must fail if no password is set
    console.error('CRITICAL: ADMIN_PASSWORD_HASH must be set in production!');
    throw new Error('ADMIN_PASSWORD_HASH must be set in production');
  }
  
  try {
    const isValid = await bcrypt.compare(cleanPassword, hashedPassword);
    if (!isValid) {
      console.log('Password verification failed for provided password.');
    }
    return isValid;
  } catch (error) {
    console.error('Error during password verification:', error);
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password.trim(), 10);
}
