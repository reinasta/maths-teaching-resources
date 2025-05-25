import React from 'react';
import { render, screen } from '@testing-library/react';
import CoordinatePlane from './CoordinatePlane';

jest.mock('d3');

describe('CoordinatePlane', () => {
  it('renders without crashing', () => {
    render(<CoordinatePlane />);
    // Check for a canvas or svg or main container
    expect(screen.getByTestId('coordinate-plane-canvas') || screen.getByRole('region')).toBeTruthy();
  });
});
