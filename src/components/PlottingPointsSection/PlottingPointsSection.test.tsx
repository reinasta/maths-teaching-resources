import React from 'react';
import { render, screen } from '@testing-library/react';
import PlottingPointsSection from './PlottingPointsSection';

jest.mock('d3');

describe('PlottingPointsSection', () => {
  it('renders without crashing', () => {
    render(<PlottingPointsSection />);
    // Check for a main container or heading
    expect(screen.getByTestId('plotting-points-section') || screen.getByRole('region')).toBeTruthy();
  });
});
