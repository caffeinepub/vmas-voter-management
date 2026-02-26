import { getUsers, getSessions, setSessions } from './storage';
import type { Session, User } from './types';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function login(username: string, password: string): string | null {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.passwordHash === password);
  if (!user) return null;

  const token = generateToken();
  const sessions = getSessions().filter(s => s.userId !== user.userId); // remove old sessions for user
  sessions.push({
    userId: user.userId,
    token,
    lastActivity: Date.now(),
  });
  setSessions(sessions);
  return token;
}

export function logout(token: string): void {
  const sessions = getSessions().filter(s => s.token !== token);
  setSessions(sessions);
}

export function getSession(token: string): Session | null {
  const sessions = getSessions();
  const session = sessions.find(s => s.token === token);
  if (!session) return null;

  const now = Date.now();
  if (now - session.lastActivity > SESSION_TIMEOUT_MS) {
    // Expired — remove it
    setSessions(sessions.filter(s => s.token !== token));
    return null;
  }

  return session;
}

export function refreshSession(token: string): void {
  const sessions = getSessions();
  const idx = sessions.findIndex(s => s.token === token);
  if (idx !== -1) {
    sessions[idx] = { ...sessions[idx], lastActivity: Date.now() };
    setSessions(sessions);
  }
}

export function getCurrentUser(token: string): User | null {
  const session = getSession(token);
  if (!session) return null;
  const users = getUsers();
  return users.find(u => u.userId === session.userId) ?? null;
}
