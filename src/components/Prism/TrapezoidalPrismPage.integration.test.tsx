import React from 'react';
import { render, screen, act } from '@testing-library/react';
import TrapezoidalPrismPage from '../../app/components/standalone/trapezoidal-prism/page';

// Integration test for controls and 3D visualisation

describe('TrapezoidalPrismPage Integration', () => {
  it('renders the page and shows loading spinner or main container', async () => {
    render(<TrapezoidalPrismPage />);
    // Check for loading spinner or main container
    expect(screen.getByRole('main')).toBeInTheDocument();
    // Optionally, check for spinner
    expect(screen.getByRole('main').innerHTML).toMatch(/spin|container/i);
  });

  it('handles window resize events without crashing', () => {
    render(<TrapezoidalPrismPage />);
    act(() => {
      global.innerWidth = 500;
      global.innerHeight = 800;
      global.dispatchEvent(new Event('resize'));
    });
    // Still renders main container
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
