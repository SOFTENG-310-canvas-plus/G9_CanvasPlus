import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LinkVaultWidget from '../components/LinkVaultWidget';

describe('LinkVaultWidget', () => {
  describe('Initial Render', () => {
    test('renders the component with title', () => {
      render(<LinkVaultWidget />);
      expect(screen.getByText('Link Vault')).toBeInTheDocument();
    });

    test('displays "Add Link" button', () => {
      render(<LinkVaultWidget />);
      expect(screen.getByText('+ Add Link')).toBeInTheDocument();
    });

    test('shows empty state message when no links exist', () => {
      render(<LinkVaultWidget />);
      expect(screen.getByText('No links yet. Click "Add Link" to get started!')).toBeInTheDocument();
      expect(screen.getByText('🔗')).toBeInTheDocument();
    });

    test('displays link counter showing 0 links', () => {
      render(<LinkVaultWidget />);
      expect(screen.getByText('0 links')).toBeInTheDocument();
    });

    test('does not show category filter when no links exist', () => {
      render(<LinkVaultWidget />);
      expect(screen.queryByText('All Categories')).not.toBeInTheDocument();
    });
  });

  describe('Add Link Modal', () => {
    test('opens modal when "Add Link" button is clicked', () => {
      render(<LinkVaultWidget />);
      const addButton = screen.getByText('+ Add Link');
      fireEvent.click(addButton);
      expect(screen.getByText('Add New Link')).toBeInTheDocument();
    });

    test('modal has Cancel and Add Link buttons', () => {
      render(<LinkVaultWidget />);
      fireEvent.click(screen.getByText('+ Add Link'));
      
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Link' })).toBeInTheDocument();
    });

    test('Add Link button is disabled when URL is empty', () => {
      render(<LinkVaultWidget />);
      fireEvent.click(screen.getByText('+ Add Link'));
      
      const addButton = screen.getByRole('button', { name: 'Add Link' });
      expect(addButton).toBeDisabled();
    });
  });

  
});