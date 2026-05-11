/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, act, render, waitFor } from '@testing-library/react';
import HealthCheck from './HealthCheck';
import { UserProvider } from '../contexts/UserContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import '@testing-library/jest-dom/vitest';

// Mock matchMedia to prevent errors from ThemeProvider
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <NotificationProvider>
      <UserProvider>
        <ThemeProvider>
          {ui}
        </ThemeProvider>
      </UserProvider>
    </NotificationProvider>
  );
};

describe('HealthCheck', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows loading state initially', async () => {
    renderWithProviders(<HealthCheck />);

    // Check for "Select User" because the App forces user selection first
    expect(await screen.findByText('Select User')).toBeInTheDocument();
  });
});
