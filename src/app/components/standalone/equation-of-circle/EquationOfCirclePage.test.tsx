import React from 'react';
import { render, screen, act } from '@testing-library/react';
import EquationOfCirclePage from './page';

// Mock the EquationOfCircle component to simplify page testing
jest.mock('@/components/EquationOfCircle', () => {
  return function DummyEquationOfCircle() {
    return <div data-testid="mock-equation-of-circle">Mock Equation of Circle Video</div>;
  };
});

describe('EquationOfCirclePage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders the loading spinner initially and then the main content', async () => {
    render(<EquationOfCirclePage />);
    
    // Check for loading spinner using class selector
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Check for page title and the mocked component
    expect(await screen.findByText('Equation of a Circle Video')).toBeInTheDocument();
    expect(screen.getByText('Watch this video demonstration about the equation of a circle with centre (a,b).')).toBeInTheDocument();
    expect(screen.getByTestId('mock-equation-of-circle')).toBeInTheDocument();
  });
});
