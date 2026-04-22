/** Single source of truth — must match between sign (auth) and verify (middleware). */
export const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_for_mvp';
