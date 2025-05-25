import { render, screen } from '@testing-library/react';
import TrapezoidalPrismPage from '@/app/components/standalone/trapezoidal-prism/page';

// Simple mocks
jest.mock('@/components/Prism/TrapezoidalPrism', () => {
  return () => <div data-testid="trapezoidal-prism-mock">TrapezoidalPrism Mock</div>;
});

jest.mock('@/components/PrismControls/TrapezoidalPrismControls', () => {
  return () => <div>TrapezoidalPrismControls Mock</div>;
});

jest.mock('@/components/LabelLegend/LabelLegend', () => {
  return () => <div>LabelLegend Mock</div>;
});

describe('TrapezoidalPrismPage Minimal', () => {
  it('renders without crashing', () => {
    render(<TrapezoidalPrismPage />);
    expect(document.body).toBeInTheDocument();
  });
});
