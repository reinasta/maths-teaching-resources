import React from 'react';
import { render, screen } from '@testing-library/react';
import ConversionGraph from './ConversionGraph';

jest.mock('d3');

describe('ConversionGraph', () => {
  it('renders without crashing', () => {
    render(<ConversionGraph />);
    // Check for a canvas or svg or main container
    expect(screen.getByTestId('conversion-graph-canvas') || screen.getByRole('region')).toBeTruthy();
  });
});
