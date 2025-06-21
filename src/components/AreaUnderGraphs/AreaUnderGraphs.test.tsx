import React from 'react';
import { render, screen } from '@testing-library/react';
import AreaUnderGraphs from './AreaUnderGraphs';

describe('AreaUnderGraphs Video Component', () => {
  it('renders without crashing and displays the video', () => {
    render(<AreaUnderGraphs />);
    expect(screen.getByText('Area Under Graphs')).toBeInTheDocument();
    const videoElement = screen.getByTestId('area-under-graphs-video');
    expect(videoElement).toBeInTheDocument();
    expect(videoElement.querySelector('source[src="/videos/components/AreaUnderGraphsScene.mp4"]')).toBeInTheDocument();
  });
});
