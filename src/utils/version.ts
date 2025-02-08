export const APP_VERSION = '1.0.1';

export function checkVersion() {
  const lastVersion = localStorage.getItem('app_version');
  const currentVersion = APP_VERSION;

  if (lastVersion !== currentVersion) {
    localStorage.setItem('app_version', currentVersion);
    return false;
  }
  return true;
}
