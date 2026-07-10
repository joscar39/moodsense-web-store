import bcrypt from "bcryptjs";

/** Cost factor 12 ≈ 250ms per hash: slow enough for brute force, fine for login UX. */
const BCRYPT_COST = 12;

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, BCRYPT_COST);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
