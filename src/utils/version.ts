// Get version from package.json
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '2.5.5';

export function checkVersion() {
  const lastVersion = localStorage.getItem('app_version');
  const currentVersion = APP_VERSION;

  if (lastVersion !== currentVersion) {
    localStorage.setItem('app_version', currentVersion);
    return false;
  }
  return true;
}
