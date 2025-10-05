
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
import CanvasWidget from '../components/CanvasWidget';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import "@testing-library/jest-dom/vitest";

const mockTodos = [
  {
    id: 1,
    title: 'Assignment 1',
    course: 'SOFTENG 310',
    dueDate: '2025-08-25T23:59:00Z',
  },
  {
    id: 2,
    title: 'Lab 2',
    course: 'SOFTENG 306',
    dueDate: '2025-08-22T17:00:00Z',
  },
];

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockTodos),
    })
  );
});

describe('CanvasWidget', () => {
  it('renders dropdowns', async () => {
    const { container } = render(<CanvasWidget />);
    const utils = within(container);
    await waitFor(() => expect(utils.getByText('All Courses')).toBeInTheDocument());
    expect(utils.getByText('All Dates')).toBeInTheDocument();
  });
});
