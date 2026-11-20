import { handlers } from "@/lib/auth";

/**
 * /api/auth/*: endpoints de Auth.js (login, logout, callback de OAuth, sesión).
 *
 * @example
 * fetch("/api/auth/session") // 200 { user: { id, role, ... } } o null sin sesión
 */
export const { GET, POST } = handlers;
