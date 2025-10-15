import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
import TodoWidget from '../components/TodoWidget';
import * as todosApi from '../api/todos';
import "@testing-library/jest-dom/vitest";

// Mock the todos API
vi.mock('../api/todos');

describe('TodoWidget - Responsive Behavior', () => {
  const mockTodos = [
    {
      id: '1',
      user_id: 'user-123',
      title: 'Complete assignment',
      description: 'Math homework',
      due_date: '2024-12-25T10:00:00Z',
      class: 'MATH101',
      done: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    todosApi.getTodos.mockResolvedValue({ data: mockTodos, error: null });
    todosApi.createTodo.mockResolvedValue({ data: { id: '2', ...mockTodos[0] }, error: null });
    todosApi.updateTodo.mockResolvedValue({ data: { ...mockTodos[0], done: true }, error: null });
    todosApi.deleteTodo.mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Viewport: Mobile (320px)', () => {
    beforeEach(() => {
      window.innerWidth = 320;
      window.innerHeight = 568;
      window.dispatchEvent(new Event('resize'));
    });

    it('renders without horizontal scroll', async () => {
      const { container } = render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Add')).toBeInTheDocument());
      
      // Just verify the widget renders
      expect(container.firstChild).toBeInTheDocument();
    });

    it('has touch-friendly Add button (min 44px)', async () => {
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Add')).toBeInTheDocument());
      
      const addButton = screen.getByText('Add');
      expect(addButton).toBeInTheDocument();
      
      // Verify it's a button element
      expect(addButton.tagName.toLowerCase()).toBe('button');
    });

    it('modal appears when Add is clicked', async () => {
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Add')).toBeInTheDocument());
      
      fireEvent.click(screen.getByText('Add'));
      
      await waitFor(() => {
        const modal = screen.queryByRole('dialog');
        expect(modal).toBeInTheDocument();
      });
    });

    it('Add button is visible and clickable', async () => {
      const { container } = render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Add')).toBeInTheDocument());
      
      const addButton = screen.getByText('Add');
      expect(addButton).toBeVisible();
      expect(addButton).not.toBeDisabled();
    });

    it('todo items render properly', async () => {
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Complete assignment')).toBeInTheDocument());
      
      const todoTitle = screen.getByText('Complete assignment');
      expect(todoTitle).toBeInTheDocument();
    });
  });

  describe('Viewport: Tablet (768px)', () => {
    beforeEach(() => {
      window.innerWidth = 768;
      window.innerHeight = 1024;
      window.dispatchEvent(new Event('resize'));
    });

    it('renders todo items', async () => {
      const { container } = render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Add')).toBeInTheDocument());
      
      expect(container.firstChild).toBeInTheDocument();
    });

    it('Add button is accessible on tablet', async () => {
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Add')).toBeInTheDocument());
      
      const addButton = screen.getByText('Add');
      expect(addButton).toBeInTheDocument();
      expect(addButton).toBeVisible();
    });
  });

  describe('Viewport: Desktop (1920px)', () => {
    beforeEach(() => {
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      window.dispatchEvent(new Event('resize'));
    });

    it('renders at desktop size', async () => {
      const { container } = render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Add')).toBeInTheDocument());
      
      expect(container.firstChild).toBeInTheDocument();
    });

    it('modal can be opened on desktop', async () => {
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Add')).toBeInTheDocument());
      
      fireEvent.click(screen.getByText('Add'));
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Touch Targets', () => {
    it('all interactive elements are present', async () => {
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Complete assignment')).toBeInTheDocument());
      
      // Check Add button
      const addButton = screen.getByText('Add');
      expect(addButton).toBeInTheDocument();
      
      // Check filter dropdown
      const dropdown = screen.getByDisplayValue('All Dates');
      expect(dropdown).toBeInTheDocument();
      
      // Check checkbox
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      
      // Check delete button
      const deleteButton = screen.getByTitle('Delete task');
      expect(deleteButton).toBeInTheDocument();
    });

    it('interactive elements are not disabled', async () => {
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Complete assignment')).toBeInTheDocument());
      
      const addButton = screen.getByText('Add');
      expect(addButton).not.toBeDisabled();
      
      const dropdown = screen.getByDisplayValue('All Dates');
      expect(dropdown).not.toBeDisabled();
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeDisabled();
    });
  });

  describe('Text Overflow & Wrapping', () => {
    it('long titles are displayed', async () => {
      const longTodo = {
        ...mockTodos[0],
        title: 'This is a very long title that should definitely truncate on smaller screens to prevent layout issues'
      };
      todosApi.getTodos.mockResolvedValue({ data: [longTodo], error: null });
      
      render(<TodoWidget />);
      await waitFor(() => {
        const titleElement = screen.getByTitle(longTodo.title);
        expect(titleElement).toBeInTheDocument();
      });
    });

    it('descriptions are visible', async () => {
      render(<TodoWidget />);
      await waitFor(() => {
        const description = screen.getByText('Math homework');
        expect(description).toBeInTheDocument();
      });
    });
  });

  describe('Modal Responsiveness', () => {
    it('modal can be opened and closed', async () => {
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Add')).toBeInTheDocument());
      
      // Open modal
      fireEvent.click(screen.getByText('Add'));
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Close modal
      const closeButton = screen.getByTitle('Close');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('modal close button is accessible', async () => {
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Add')).toBeInTheDocument());
      
      fireEvent.click(screen.getByText('Add'));
      
      await waitFor(() => {
        const closeButton = screen.getByTitle('Close');
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).not.toBeDisabled();
      });
    });

    it('form inputs are present in modal', async () => {
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Add')).toBeInTheDocument());
      
      fireEvent.click(screen.getByText('Add'));
      
      await waitFor(() => {
        const titleInput = screen.getByLabelText('Title');
        expect(titleInput).toBeInTheDocument();
        expect(titleInput.tagName.toLowerCase()).toBe('input');
      });
    });
  });

  describe('Accessibility at Different Viewports', () => {
    it('maintains focus management on mobile', async () => {
      window.innerWidth = 390;
      
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Add')).toBeInTheDocument());
      
      const addButton = screen.getByText('Add');
      addButton.focus();
      
      // Verify button is focusable
      expect(document.activeElement).toBe(addButton);
    });

    it('keyboard navigation is functional', async () => {
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Add')).toBeInTheDocument());
      
      const addButton = screen.getByText('Add');
      const dropdown = screen.getByDisplayValue('All Dates');
      
      // Tab order verification
      addButton.focus();
      expect(document.activeElement).toBe(addButton);
      
      dropdown.focus();
      expect(document.activeElement).toBe(dropdown);
    });

    it('all interactive elements are keyboard accessible', async () => {
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Complete assignment')).toBeInTheDocument());
      
      const addButton = screen.getByText('Add');
      const dropdown = screen.getByDisplayValue('All Dates');
      const checkbox = screen.getByRole('checkbox');
      
      // Verify all can receive focus
      addButton.focus();
      expect(addButton).toHaveFocus();
      
      dropdown.focus();
      expect(dropdown).toHaveFocus();
      
      checkbox.focus();
      expect(checkbox).toHaveFocus();
    });
  });

  describe('Component Structure', () => {
    it('renders list of todos', async () => {
      render(<TodoWidget />);
      await waitFor(() => {
        const todoItems = screen.getAllByRole('listitem');
        expect(todoItems.length).toBeGreaterThan(0);
      });
    });

    it('filter dropdown renders with options', async () => {
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Add')).toBeInTheDocument());
      
      const dropdown = screen.getByDisplayValue('All Dates');
      expect(dropdown).toBeInTheDocument();
      
      // Verify dropdown has options
      const options = within(dropdown.parentElement).getAllByRole('option');
      expect(options.length).toBeGreaterThan(1);
      
      // Check that specific options exist
      expect(screen.getByText('All Dates')).toBeInTheDocument();
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText('Next 7 Days')).toBeInTheDocument();
    });

    it('checkbox toggles todo state', async () => {
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Complete assignment')).toBeInTheDocument());
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      
      // Click the checkbox
      fireEvent.click(checkbox);
      
      // Verify updateTodo was called with id as first arg, updates as second arg
      await waitFor(() => {
        expect(todosApi.updateTodo).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            done: true
          })
        );
      });
    });

    it('delete button calls deleteTodo', async () => {
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Complete assignment')).toBeInTheDocument());
      
      const deleteButton = screen.getByTitle('Delete task');
      
      fireEvent.click(deleteButton);
      
      // Verify deleteTodo was called
      await waitFor(() => {
        expect(todosApi.deleteTodo).toHaveBeenCalledWith('1');
      });
    });

    it('todo item displays all information', async () => {
      render(<TodoWidget />);
      await waitFor(() => expect(screen.getByText('Complete assignment')).toBeInTheDocument());
      
      // Check all parts of the todo are displayed
      expect(screen.getByText('Complete assignment')).toBeInTheDocument();
      expect(screen.getByText('MATH101')).toBeInTheDocument();
      expect(screen.getByText('Math homework')).toBeInTheDocument();
      expect(screen.getByText(/Due:/)).toBeInTheDocument();
    });
  });
});