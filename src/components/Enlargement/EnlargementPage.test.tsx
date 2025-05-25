import React from 'react';
import { render, screen } from '@testing-library/react';
import EnlargementPage from '@/app/components/standalone/enlargement/page';

jest.mock('three');

describe('EnlargementPage', () => {
  it('renders the video and main content', () => {
    render(<EnlargementPage />);
    // Check for a video element
    expect(screen.getByTestId('enlargement-canvas')).toBeInTheDocument();
    // Check for a heading or unique text
    const headings = screen.getAllByRole('heading', { name: /Enlargement/i });
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });
});
