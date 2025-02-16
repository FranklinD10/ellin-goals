import { describe, it, expect } from 'vitest';
import { screen, act } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import HealthCheck from './HealthCheck';

describe('HealthCheck', () => {
  it('renders health check title', async () => {
    await act(async () => {
      renderWithProviders(<HealthCheck />);
    });
    expect(screen.getByRole('heading', { name: /System Health Check/i })).toBeInTheDocument();
  });

  it('shows loading state initially', async () => {
    await act(async () => {
      renderWithProviders(<HealthCheck />);
    });
    expect(screen.getByText(/running health checks/i)).toBeInTheDocument();
  });
});