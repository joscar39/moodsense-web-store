import bcrypt from "bcryptjs";

/** Coste 12 ≈ 250 ms por hash: lento para fuerza bruta, aceptable para el login. */
const BCRYPT_COST = 12;

/**
 * Hashea una contraseña con bcrypt para guardarla en `passwordHash`.
 *
 * @example
 * const passwordHash = await hashPassword("segura1234");
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, BCRYPT_COST);
}

/**
 * Compara una contraseña en texto plano con su hash bcrypt.
 *
 * @example
 * if (!(await verifyPassword(input, user.passwordHash))) return null;
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
