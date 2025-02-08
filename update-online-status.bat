@echo off
setlocal EnableDelayedExpansion

set "HOOKS_DIR=src\hooks"
set "OLD_FILE=%HOOKS_DIR%\useOnlineStatus.ts"
set "NEW_FILE=%HOOKS_DIR%\useOnlineStatus.tsx"
set "BACKUP_FILE=%HOOKS_DIR%\useOnlineStatus.ts.bak"

echo Creating backup of existing file if it exists...
if exist "%OLD_FILE%" (
    move "%OLD_FILE%" "%BACKUP_FILE%"
    echo Backup created as %BACKUP_FILE%
)

echo Creating new TSX file...
(
echo import React from 'react';
echo import { IconWifi, IconWifiOff } from '@tabler/icons-react';
echo.
echo interface OnlineStatusResult {
echo   isOnline^: boolean;
echo   icon^: React.ReactNode;
echo }
echo.
echo export const useOnlineStatus = ^(^)^: OnlineStatusResult =^> {
echo   const [isOnline, setIsOnline] = React.useState^(navigator.onLine^);
echo.
echo   React.useEffect^(^(^) =^> {
echo     const handleOnline = ^(^) =^> setIsOnline^(true^);
echo     const handleOffline = ^(^) =^> setIsOnline^(false^);
echo.
echo     window.addEventListener^('online', handleOnline^);
echo     window.addEventListener^('offline', handleOffline^);
echo.
echo     return ^(^) =^> {
echo       window.removeEventListener^('online', handleOnline^);
echo       window.removeEventListener^('offline', handleOffline^);
echo     };
echo   }, []^);
echo.
echo   return {
echo     isOnline,
echo     icon^: isOnline ? ^<IconWifi size={16} /^> ^: ^<IconWifiOff size={16} /^>
echo   };
echo };
) > "%NEW_FILE%"

echo Done! Please restart your development server with 'npm run dev'
pause
