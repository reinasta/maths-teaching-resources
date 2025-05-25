import React from 'react';
import { render, screen } from '@testing-library/react';
import ConversionSlidesPage from '@/app/slides/conversion/page';

describe('ConversionSlidesPage', () => {
  it('renders the Reveal.js container', () => {
    render(<ConversionSlidesPage />);
    // Check for Reveal.js main container
    const region = screen.queryByRole('region');
    const reveal = screen.queryByTestId('reveal-container');
    expect(region || reveal).toBeTruthy();
  });
});
