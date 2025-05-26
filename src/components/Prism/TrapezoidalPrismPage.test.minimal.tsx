import { render } from '@testing-library/react';
import TrapezoidalPrismPage from '@/app/components/standalone/trapezoidal-prism/page';

// Simple mocks
jest.mock('@/components/Prism/TrapezoidalPrism', () => {
  const MockComponent = () => <div data-testid="trapezoidal-prism-mock">TrapezoidalPrism Mock</div>;
  MockComponent.displayName = 'TrapezoidalPrismMock';
  return MockComponent;
});

jest.mock('@/components/PrismControls/TrapezoidalPrismControls', () => {
  const MockComponent = () => <div>TrapezoidalPrismControls Mock</div>;
  MockComponent.displayName = 'TrapezoidalPrismControlsMock';
  return MockComponent;
});

jest.mock('@/components/LabelLegend/LabelLegend', () => {
  const MockComponent = () => <div>LabelLegend Mock</div>;
  MockComponent.displayName = 'LabelLegendMock';
  return MockComponent;
});

describe('TrapezoidalPrismPage Minimal', () => {
  it('renders without crashing', () => {
    render(<TrapezoidalPrismPage />);
    expect(document.body).toBeInTheDocument();
  });
});
