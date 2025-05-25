import React from 'react';
import { render, screen } from '@testing-library/react';
import TriangularPrismComponent from './TriangularPrismComponent';

jest.mock('three');

describe('TriangularPrismComponent', () => {
  it('renders without crashing', () => {
    render(<TriangularPrismComponent />);
    // Check for the main heading and canvas element
    expect(screen.getByText('Triangular Prism Visualization')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Triangular Prism Visualization' })).toBeInTheDocument();
    
    // Check for canvas element
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
