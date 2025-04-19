/// <reference types="@testing-library/jest-dom" />
/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { screen, act, render } from '@testing-library/react';
import HealthCheck from './HealthCheck';

describe('HealthCheck', () => {
  it('renders health check title', async () => {
    await act(async () => {
      render(<HealthCheck />);
    });
    expect(screen.getByRole('heading', { name: /System Health Check/i })).toBeInTheDocument();
  });

  it('shows loading state initially', async () => {
    await act(async () => {
      render(<HealthCheck />);
    });
    expect(screen.getByText(/running health checks/i)).toBeInTheDocument();
  });
});