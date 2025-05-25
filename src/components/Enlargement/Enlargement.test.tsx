import React from 'react';
import { render, screen } from '@testing-library/react';
import Enlargement from './Enlargement';

jest.mock('three');

describe('Enlargement 3D Visualisation', () => {
  it('renders without crashing', () => {
    render(<Enlargement />);
    // Check for a canvas or main container
    expect(screen.getByTestId('enlargement-canvas') || screen.getByRole('region')).toBeTruthy();
  });
});
