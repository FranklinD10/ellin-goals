// User storage constants and utilities
export const LAST_USER_KEY = 'last_active_user';

export function getLastActiveUser(): string | null {
  return localStorage.getItem(LAST_USER_KEY);
}

export function setLastActiveUser(user: string) {
  localStorage.setItem(LAST_USER_KEY, user);
}