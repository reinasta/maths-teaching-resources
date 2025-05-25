import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TrapezoidalPrismControls from './TrapezoidalPrismControls';

const defaultDimensions = { topWidth: 2, bottomWidth: 4, height: 3, depth: 5 };
const defaultCalculations = { leftSide: 3.6, rightSide: 3.6, surfaceArea: 100, volume: 45 };
const defaultLabelConfig = { showVolume: true, showSurfaceArea: false, showFaces: false };

describe('TrapezoidalPrismControls', () => {
  it('renders all controls and calculation values', () => {
    render(
      <TrapezoidalPrismControls
        dimensions={defaultDimensions}
        calculations={defaultCalculations}
        onDimensionsChange={jest.fn()}
        onUnfoldChange={jest.fn()}
        visualStyle="solid"
        onVisualStyleChange={jest.fn()}
        labelConfig={defaultLabelConfig}
        onLabelConfigChange={jest.fn()}
      />
    );
    // Headings
    expect(screen.getByText(/Trapezoidal Prism Controls/i)).toBeInTheDocument();
    expect(screen.getByText(/Calculations/i)).toBeInTheDocument();
    // Sliders
    expect(screen.getByLabelText(/Top Width/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bottom Width/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Height/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Depth/i)).toBeInTheDocument();
    // Visual style selector
    expect(screen.getByLabelText(/Visual Style/i)).toBeInTheDocument();
    // Label checkboxes
    expect(screen.getByLabelText(/Volume Labels/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Surface Area Labels/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Face Labels/i)).toBeInTheDocument();
    // Calculation values
    expect(screen.getByText(/100.00 sq units/i)).toBeInTheDocument();
    expect(screen.getByText(/45.00 cubic units/i)).toBeInTheDocument();
  });

  it('calls onUnfoldChange when unfold button is clicked', () => {
    const onUnfoldChange = jest.fn();
    render(
      <TrapezoidalPrismControls
        dimensions={defaultDimensions}
        calculations={defaultCalculations}
        onDimensionsChange={jest.fn()}
        onUnfoldChange={onUnfoldChange}
        visualStyle="solid"
        onVisualStyleChange={jest.fn()}
        labelConfig={defaultLabelConfig}
        onLabelConfigChange={jest.fn()}
      />
    );
    const button = screen.getByRole('button', { name: /unfold prism/i });
    fireEvent.click(button);
    expect(onUnfoldChange).toHaveBeenCalledWith(true);
  });

  it('calls onDimensionsChange when a slider is changed', () => {
    const onDimensionsChange = jest.fn();
    render(
      <TrapezoidalPrismControls
        dimensions={defaultDimensions}
        calculations={defaultCalculations}
        onDimensionsChange={onDimensionsChange}
        onUnfoldChange={jest.fn()}
        visualStyle="solid"
        onVisualStyleChange={jest.fn()}
        labelConfig={defaultLabelConfig}
        onLabelConfigChange={jest.fn()}
      />
    );
    const slider = screen.getByLabelText(/Top Width/i);
    fireEvent.change(slider, { target: { value: '3' } });
    expect(onDimensionsChange).toHaveBeenCalledWith({ ...defaultDimensions, topWidth: 3 });
  });

  it('calls onLabelConfigChange when a label checkbox is toggled', () => {
    const onLabelConfigChange = jest.fn();
    render(
      <TrapezoidalPrismControls
        dimensions={defaultDimensions}
        calculations={defaultCalculations}
        onDimensionsChange={jest.fn()}
        onUnfoldChange={jest.fn()}
        visualStyle="solid"
        onVisualStyleChange={jest.fn()}
        labelConfig={defaultLabelConfig}
        onLabelConfigChange={onLabelConfigChange}
      />
    );
    const checkbox = screen.getByLabelText(/Surface Area Labels/i);
    fireEvent.click(checkbox);
    expect(onLabelConfigChange).toHaveBeenCalledWith({ ...defaultLabelConfig, showSurfaceArea: true });
  });

  it('toggles all label checkboxes and updates labelConfig correctly', () => {
    const onLabelConfigChange = jest.fn();
    render(
      <TrapezoidalPrismControls
        dimensions={defaultDimensions}
        calculations={defaultCalculations}
        onDimensionsChange={jest.fn()}
        onUnfoldChange={jest.fn()}
        visualStyle="solid"
        onVisualStyleChange={jest.fn()}
        labelConfig={defaultLabelConfig}
        onLabelConfigChange={onLabelConfigChange}
      />
    );
    const volumeCheckbox = screen.getByLabelText(/Volume Labels/i);
    const surfaceAreaCheckbox = screen.getByLabelText(/Surface Area Labels/i);
    const faceCheckbox = screen.getByLabelText(/Face Labels/i);
    fireEvent.click(volumeCheckbox);
    expect(onLabelConfigChange).toHaveBeenCalledWith({ ...defaultLabelConfig, showVolume: false });
    fireEvent.click(surfaceAreaCheckbox);
    expect(onLabelConfigChange).toHaveBeenCalledWith({ ...defaultLabelConfig, showSurfaceArea: true });
    fireEvent.click(faceCheckbox);
    expect(onLabelConfigChange).toHaveBeenCalledWith({ ...defaultLabelConfig, showFaces: true });
  });

  it('has accessible labels for all controls', () => {
    render(
      <TrapezoidalPrismControls
        dimensions={defaultDimensions}
        calculations={defaultCalculations}
        onDimensionsChange={jest.fn()}
        onUnfoldChange={jest.fn()}
        visualStyle="solid"
        onVisualStyleChange={jest.fn()}
        labelConfig={defaultLabelConfig}
        onLabelConfigChange={jest.fn()}
      />
    );
    expect(screen.getByLabelText(/Top Width/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bottom Width/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Height/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Depth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Visual Style/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Volume Labels/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Surface Area Labels/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Face Labels/i)).toBeInTheDocument();
  });
});
