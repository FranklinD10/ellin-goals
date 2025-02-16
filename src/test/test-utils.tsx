import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { UserProvider } from '../contexts/UserContext';
import { AuthProvider } from '../contexts/AuthContext';

export function renderWithProviders(
  ui: React.ReactElement,
  { route = '/' } = {}
) {
  window.history.pushState({}, 'Test page', route);

  return render(
    <AuthProvider>
      <UserProvider>
        <ThemeProvider>
          <NotificationProvider>
            <BrowserRouter>
              {ui}
            </BrowserRouter>
          </NotificationProvider>
        </ThemeProvider>
      </UserProvider>
    </AuthProvider>
  );
}