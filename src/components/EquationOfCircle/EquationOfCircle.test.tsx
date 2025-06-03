import React from 'react';
import { render, screen } from '@testing-library/react';
import EquationOfCircle from './EquationOfCircle';

describe('EquationOfCircle Video Component', () => {
  it('renders without crashing and displays the video', () => {
    render(<EquationOfCircle />);
    expect(screen.getByText('Equation of a Circle')).toBeInTheDocument();
    const videoElement = screen.getByTestId('equation-of-circle-video');
    expect(videoElement).toBeInTheDocument();
    expect(videoElement.querySelector('source[src="/videos/components/PythagorasCircleIllustration.mp4"]')).toBeInTheDocument();
  });
});
