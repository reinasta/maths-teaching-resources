import React from 'react';
import { render } from '@testing-library/react';
import TrapezoidalPrismPage from '@/app/components/standalone/trapezoidal-prism/page';

jest.mock('@/components/Prism/TrapezoidalPrism', () => {
  return jest.fn(() => null);
});

jest.mock('@/components/PrismControls/TrapezoidalPrismControls', () => {
  return jest.fn(() => null);
});

jest.mock('@/components/LabelLegend/LabelLegend', () => {
  return jest.fn(() => null);
});

describe('TrapezoidalPrismPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<TrapezoidalPrismPage />);
    expect(container).toBeInTheDocument();
  });
});
