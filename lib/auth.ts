export async function verifyPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  
  // Development fallback
  if (!adminPassword && process.env.NODE_ENV !== 'production') {
    return password === 'Admin123';
  }
  
  // Production requires ADMIN_PASSWORD to be set
  if (!adminPassword && process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_PASSWORD must be set in production');
  }
  
  return password === adminPassword;
}
