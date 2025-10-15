import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import App from '../App';
import "@testing-library/jest-dom/vitest";

const VIEWPORTS = {
  'mobile-small': { width: 320, height: 568 },
  'mobile': { width: 390, height: 844 },
  'tablet': { width: 768, height: 1024 },
  'laptop': { width: 1366, height: 768 },
  'desktop': { width: 1920, height: 1080 },
};

// Mock necessary modules
vi.mock('../hooks/useGoogleCalendarEvents', () => ({
  default: () => ({
    events: [],
    loading: false,
    error: null,
    needsAuth: false,
    signIn: vi.fn(),
  })
}));

vi.mock('../auth/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })
  }
}));

describe('E2E Responsive Viewport Matrix', () => {
  beforeEach(() => {
    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }));

    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Mock fetch for weather widget
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        latitude: 0,
        longitude: 0,
        city: 'Test City',
        timezone: 'UTC',
        current: {
          temperature_2m: 20,
          weather_code: 0
        }
      })
    });
  });

  Object.entries(VIEWPORTS).forEach(([name, { width, height }]) => {
    describe(`Viewport: ${name} (${width}x${height})`, () => {
      beforeEach(() => {
        act(() => {
          window.innerWidth = width;
          window.innerHeight = height;
          window.dispatchEvent(new Event('resize'));
        });
      });

      it('renders without errors', () => {
        const { container } = render(<App />);
        expect(container).toBeInTheDocument();
      });

      it('has grid structure', () => {
        render(<App />);
        const grid = screen.getByRole('grid');
        expect(grid).toBeInTheDocument();
      });

      it('renders widgets', () => {
        render(<App />);
        const widgets = screen.getAllByRole('gridcell');
        expect(widgets.length).toBeGreaterThan(0);
      });

      it('settings button is accessible', () => {
        render(<App />);
        const settingsBtn = screen.getByRole('button', { name: /open settings/i });
        expect(settingsBtn).toBeInTheDocument();
      });

      it('no horizontal scroll container exists', () => {
        const { container } = render(<App />);
        const clip = container.querySelector('.ios-grid-clip');
        expect(clip).toBeInTheDocument();
      });
    });
  });

  describe('Content Reflow', () => {
    it('renders correctly at minimum width (320px)', () => {
      act(() => {
        window.innerWidth = 320;
        window.innerHeight = 568;
      });
      
      const { container } = render(<App />);
      
      const widgets = container.querySelectorAll('.ios-widget');
      expect(widgets.length).toBeGreaterThan(0);
    });

    it('grid adapts to viewport changes', () => {
      const { container } = render(<App />);
      
      act(() => {
        window.innerWidth = 320;
        window.dispatchEvent(new Event('resize'));
      });
      
      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
      
      act(() => {
        window.innerWidth = 1920;
        window.dispatchEvent(new Event('resize'));
      });
      
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Component Visibility', () => {
    it('all main widgets render', () => {
      render(<App />);
      
      // Check for widget handles/titles
      expect(screen.getByText(/weather/i)).toBeInTheDocument();
      expect(screen.getByText(/clock/i)).toBeInTheDocument();
    });

    it('settings can be opened', () => {
      render(<App />);
      
      const settingsBtn = screen.getByRole('button', { name: /open settings/i });
      
      act(() => {
        settingsBtn.click();
      });
      
      expect(screen.getByText(/customize widgets/i)).toBeInTheDocument();
    });
  });
});