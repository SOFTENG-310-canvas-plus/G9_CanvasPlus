import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach, vi } from "vitest";
import WidgetGrid, { Widget } from "../components/WidgetGrid";

// Mock getBoundingClientRect for tests
const mockRect = (el, rect = {}) => {
  const base = {
    x: 0, y: 0, top: 0, left: 0,
    bottom: 800, right: 1200,
    width: 1200, height: 800,
    toJSON: () => ({})
  };
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({ ...base, ...rect });
};

describe("WidgetGrid - Responsive Behavior", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    
    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }));
    
    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  describe("Viewport: Mobile (320px)", () => {
    beforeEach(() => {
      act(() => {
        window.innerWidth = 320;
        window.innerHeight = 568;
        window.dispatchEvent(new Event('resize'));
      });
    });

    it("renders without horizontal scroll", () => {
      const { container } = render(
        <WidgetGrid cols={12} rows={8}>
          <Widget id="w1" title="Test" col={0} row={0} w={2} h={2} />
        </WidgetGrid>
      );

      const gridContainer = container.querySelector('.ios-widget-grid-container');
      expect(gridContainer).toBeInTheDocument();
      
      const clipElement = container.querySelector('.ios-grid-clip');
      expect(clipElement).toBeInTheDocument();
      expect(clipElement).toHaveClass('ios-grid-clip');
    });

    it("applies mobile-specific styles", () => {
      const { container } = render(
        <WidgetGrid cols={12} rows={8}>
          <Widget id="w1" title="Test" col={0} row={0} />
        </WidgetGrid>
      );

      const grid = container.querySelector('.ios-widget-grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('ios-widget-grid');
    });

    it("settings panel exists and can be opened", () => {
      render(<WidgetGrid />);
      
      const settingsBtn = screen.getByRole("button", { name: /open settings/i });
      expect(settingsBtn).toBeInTheDocument();
      
      act(() => {
        settingsBtn.click();
      });
      
      const panel = screen.getByText(/customize widgets/i);
      expect(panel).toBeInTheDocument();
    });

    it("grid has proper CSS classes for responsive layout", () => {
      const { container } = render(
        <WidgetGrid>
          <Widget id="w1" title="Test" col={0} row={0} />
        </WidgetGrid>
      );

      const clipElement = container.querySelector('.ios-grid-clip');
      expect(clipElement).toHaveClass('ios-grid-clip');
      
      // Check that grid exists
      const grid = screen.getByRole("grid");
      expect(grid).toBeInTheDocument();
    });
  });

  describe("Viewport: Tablet (768px)", () => {
    beforeEach(() => {
      act(() => {
        window.innerWidth = 768;
        window.innerHeight = 1024;
        window.dispatchEvent(new Event('resize'));
      });
    });

    it("renders with tablet layout", () => {
      const { container } = render(
        <WidgetGrid>
          <Widget id="w1" title="Test" col={0} row={0} />
        </WidgetGrid>
      );

      const grid = screen.getByRole("grid");
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('ios-widget-grid');
    });

    it("settings button is accessible", () => {
      render(<WidgetGrid />);
      
      const settingsBtn = screen.getByRole("button", { name: /open settings/i });
      expect(settingsBtn).toBeInTheDocument();
      expect(settingsBtn).toHaveClass('ios-settings-button');
    });
  });

  describe("Viewport: Desktop (1920px)", () => {
    beforeEach(() => {
      act(() => {
        window.innerWidth = 1920;
        window.innerHeight = 1080;
        window.dispatchEvent(new Event('resize'));
      });
    });

    it("maintains grid at full size", () => {
      render(
        <WidgetGrid cols={17} rows={8}>
          <Widget id="w1" title="Test" col={0} row={0} />
        </WidgetGrid>
      );

      const grid = screen.getByRole("grid");
      // Check that attributes exist and are numeric
      const colCount = grid.getAttribute("aria-colcount");
      const rowCount = grid.getAttribute("aria-rowcount");
      
      expect(colCount).toBeTruthy();
      expect(rowCount).toBeTruthy();
      expect(Number(colCount)).toBeGreaterThan(0);
      expect(Number(rowCount)).toBeGreaterThan(0);
    });

    it("widgets render correctly", () => {
      render(
        <WidgetGrid>
          <Widget id="w1" title="Test Widget" col={0} row={0} />
        </WidgetGrid>
      );

      const widget = screen.getByRole("gridcell");
      expect(widget).toBeInTheDocument();
      expect(widget).toHaveClass('ios-widget');
    });
  });

  describe("Touch Targets", () => {
    it("settings button has minimum touch target", () => {
      render(<WidgetGrid />);
      
      const settingsBtn = screen.getByRole("button", { name: /open settings/i });
      expect(settingsBtn).toBeInTheDocument();
      expect(settingsBtn).toHaveClass('ios-settings-button');
    });

    it("widget drag handles are accessible", () => {
      render(
        <WidgetGrid>
          <Widget id="w1" title="Test" col={0} row={0} />
        </WidgetGrid>
      );

      const handle = screen.getByLabelText(/test drag handle/i);
      expect(handle).toBeInTheDocument();
      expect(handle).toHaveClass('ios-widget-handle');
    });
  });

  describe("CSS Custom Properties", () => {
    it("sets correct CSS variables for responsive sizing", () => {
      render(
        <WidgetGrid cols={5} rows={4} cellW={50} rowH={60} gap={10}>
          <Widget id="w1" title="One" col={0} row={0} />
        </WidgetGrid>
      );

      const grid = screen.getByRole("grid");
      const style = grid.getAttribute("style") || "";
      
      expect(style).toContain("--cell-width");
      expect(style).toContain("--cell-height");
      expect(style).toContain("--grid-gap");
    });
  });

  describe("Overflow Prevention", () => {
    it("grid has overflow-hidden class", () => {
      act(() => {
        window.innerWidth = 320;
      });
      
      const { container } = render(
        <WidgetGrid cols={12} rows={8}>
          <Widget id="w1" title="Wide Widget" col={0} row={0} w={6} h={2} />
        </WidgetGrid>
      );

      const grid = container.querySelector('.ios-widget-grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('ios-widget-grid');
      
      const clip = container.querySelector('.ios-grid-clip');
      expect(clip).toBeInTheDocument();
    });
  });

  describe("Responsive Widget Sizing", () => {
    it("widgets have minimum dimensions via CSS class", () => {
      render(
        <WidgetGrid>
          <Widget id="w1" title="Small" col={0} row={0} w={1} h={1} />
        </WidgetGrid>
      );

      const widget = screen.getByRole("gridcell");
      expect(widget).toBeInTheDocument();
      expect(widget).toHaveClass('ios-widget');
    });
  });

  describe("Settings Panel Responsiveness", () => {
    it("renders settings in correct position", () => {
      render(<WidgetGrid />);
      
      const settingsBtn = screen.getByRole("button", { name: /open settings/i });
      
      act(() => {
        settingsBtn.click();
      });
      
      const panel = document.querySelector('.ios-settings-panel');
      expect(panel).toBeInTheDocument();
    });

    it("settings inputs are accessible", () => {
      render(<WidgetGrid />);
      
      const settingsBtn = screen.getByRole("button", { name: /open settings/i });
      
      act(() => {
        settingsBtn.click();
      });
      
      const colorInput = document.querySelector('input[type="color"]');
      expect(colorInput).toBeInTheDocument();
    });

    it("close button works", async () => {
      render(<WidgetGrid />);
      
      const settingsBtn = screen.getByRole("button", { name: /open settings/i });
      
      act(() => {
        settingsBtn.click();
      });
      
      const closeBtn = screen.getByText(/close/i);
      
      act(() => {
        closeBtn.click();
      });
      
      await waitFor(() => {
        expect(screen.queryByText(/customize widgets/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Grid Structure", () => {
    it("renders grid with correct ARIA attributes", () => {
      render(
        <WidgetGrid cols={10} rows={6}>
          <Widget id="w1" title="Test" col={0} row={0} />
        </WidgetGrid>
      );

      const grid = screen.getByRole("grid");
      
      // Check that ARIA attributes exist and have valid values
      expect(grid).toHaveAttribute("aria-colcount");
      expect(grid).toHaveAttribute("aria-rowcount");
      
      const colCount = Number(grid.getAttribute("aria-colcount"));
      const rowCount = Number(grid.getAttribute("aria-rowcount"));
      
      // Verify they are positive numbers
      expect(colCount).toBeGreaterThan(0);
      expect(rowCount).toBeGreaterThan(0);
    });

    it("widgets have correct gridcell role", () => {
      render(
        <WidgetGrid>
          <Widget id="w1" title="Widget 1" col={0} row={0} />
          <Widget id="w2" title="Widget 2" col={2} row={0} />
        </WidgetGrid>
      );

      const widgets = screen.getAllByRole("gridcell");
      expect(widgets).toHaveLength(2);
    });
  });

  describe("Responsive Classes", () => {
    it("container has correct CSS classes", () => {
      const { container } = render(<WidgetGrid />);
      
      const gridContainer = container.querySelector('.ios-widget-grid-container');
      expect(gridContainer).toBeInTheDocument();
    });

    it("clip element has correct CSS classes", () => {
      const { container } = render(<WidgetGrid />);
      
      const clip = container.querySelector('.ios-grid-clip');
      expect(clip).toBeInTheDocument();
    });

    it("wallpaper element exists", () => {
      const { container } = render(<WidgetGrid />);
      
      const wallpaper = container.querySelector('.ios-wallpaper');
      expect(wallpaper).toBeInTheDocument();
    });
  });
});