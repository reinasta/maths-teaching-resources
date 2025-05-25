import React from 'react';
import { render, screen } from '@testing-library/react';
import EnlargementPage from '@/app/components/standalone/enlargement/page';
jest.mock('three');

describe('EnlargementPage', () => {
  it('renders the page and key components', () => {
    render(<EnlargementPage />);
    // Check for a heading or unique text
    const headings = screen.getAllByRole('heading', { name: /Enlargement/i });
    expect(headings.length).toBeGreaterThanOrEqual(1);
    // Check for the 3D visualisation container
    expect(screen.getByTestId('enlargement-canvas')).toBeInTheDocument();
  });
});
