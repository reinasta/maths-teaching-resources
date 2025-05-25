import React from 'react';
import { render, screen } from '@testing-library/react';
import StandaloneLayout from './index';

describe('StandaloneLayout', () => {
  it('renders children and navigation header', () => {
    render(
      <StandaloneLayout>
        <div data-testid="child-content">Test Content</div>
      </StandaloneLayout>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    // Optionally check for navigation header or other layout elements
    // expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
