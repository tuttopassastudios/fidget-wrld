/**
 * Newsletter Signup Component Tests
 *
 * Tests the React component UI behavior:
 * - Form rendering and accessibility
 * - Submit flow (loading → success / error)
 * - Input validation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup';

// Mock CSS module
vi.mock('./NewsletterSignup.module.css', () => ({}));
vi.mock('@/components/newsletter/NewsletterSignup.module.css', () => ({
  default: new Proxy({}, { get: (_, prop) => String(prop) }),
}));

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('NewsletterSignup component', () => {
  it('renders email input and subscribe button', () => {
    render(<NewsletterSignup />);
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument();
  });

  it('input has correct attributes', () => {
    render(<NewsletterSignup />);
    const input = screen.getByLabelText('Email address');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('autocomplete', 'email');
    expect(input).toHaveAttribute('placeholder', 'Enter your email address…');
  });

  it('shows error for empty submission', async () => {
    const user = userEvent.setup();
    render(<NewsletterSignup />);
    await user.click(screen.getByRole('button', { name: 'Subscribe' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter your email address');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('submits email and shows success message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'Subscribed successfully' }),
    });

    const user = userEvent.setup();
    render(<NewsletterSignup />);
    await user.type(screen.getByLabelText('Email address'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: 'Subscribe' }));

    await waitFor(() => {
      expect(screen.getByText(/You're on the list/)).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
  });

  it('shows loading state during submission', async () => {
    let resolveFetch: (value: unknown) => void;
    mockFetch.mockReturnValueOnce(new Promise(resolve => { resolveFetch = resolve; }));

    const user = userEvent.setup();
    render(<NewsletterSignup />);
    await user.type(screen.getByLabelText('Email address'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: 'Subscribe' }));

    expect(screen.getByText('Subscribing…')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeDisabled();

    resolveFetch!({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await waitFor(() => {
      expect(screen.queryByText('Subscribing…')).not.toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to subscribe' }),
    });

    const user = userEvent.setup();
    render(<NewsletterSignup />);
    await user.type(screen.getByLabelText('Email address'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: 'Subscribe' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to subscribe');
    });
  });

  it('shows error message on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const user = userEvent.setup();
    render(<NewsletterSignup />);
    await user.type(screen.getByLabelText('Email address'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: 'Subscribe' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error');
    });
  });

  it('clears email input after successful submission', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const user = userEvent.setup();
    render(<NewsletterSignup />);
    await user.type(screen.getByLabelText('Email address'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: 'Subscribe' }));

    await waitFor(() => {
      expect(screen.queryByLabelText('Email address')).not.toBeInTheDocument(); // replaced by success
    });
  });
});
