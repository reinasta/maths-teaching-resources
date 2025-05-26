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

// New test suite for integration with pure state functions
describe('TrapezoidalPrismControls - State Integration', () => {
  it('should call onDimensionsChange with valid new dimensions when input is valid', () => {
    const onDimensionsChange = jest.fn();
    const initialDimensions = { topWidth: 2, bottomWidth: 4, height: 3, depth: 5 };
    render(
      <TrapezoidalPrismControls
        dimensions={initialDimensions}
        calculations={defaultCalculations}
        onDimensionsChange={onDimensionsChange}
        onUnfoldChange={jest.fn()}
        visualStyle="solid"
        onVisualStyleChange={jest.fn()}
        labelConfig={defaultLabelConfig}
        onLabelConfigChange={jest.fn()}
      />
    );

    const topWidthInput = screen.getByLabelText(/Top Width/i);
    fireEvent.change(topWidthInput, { target: { value: '3' } });

    expect(onDimensionsChange).toHaveBeenCalledWith({ ...initialDimensions, topWidth: 3 });
  });

  it('should call onDimensionsChange with sanitized dimensions for edge case inputs', () => {
    const onDimensionsChange = jest.fn();
    const initialDimensions = { topWidth: 2, bottomWidth: 4, height: 3, depth: 5 };
    
    render(
      <TrapezoidalPrismControls
        dimensions={initialDimensions}
        calculations={defaultCalculations}
        onDimensionsChange={onDimensionsChange}
        onUnfoldChange={jest.fn()}
        visualStyle="solid"
        onVisualStyleChange={jest.fn()}
        labelConfig={defaultLabelConfig}
        onLabelConfigChange={jest.fn()}
      />
    );

    const topWidthInput = screen.getByLabelText(/Top Width/i);
    // Test with an empty string - range inputs default to midpoint (3) when empty
    fireEvent.change(topWidthInput, { target: { value: '' } }); 
    // Range input with min=1, max=5 defaults to 3 when empty
    expect(onDimensionsChange).toHaveBeenCalledWith({ ...initialDimensions, topWidth: 3 });
    onDimensionsChange.mockClear();

    // Test with a value below min - range input clamps to min=1, then sanitizeDimensionInput doesn't change it
    fireEvent.change(topWidthInput, { target: { value: '0.2' } });
    expect(onDimensionsChange).toHaveBeenCalledWith({ ...initialDimensions, topWidth: 1 });
    onDimensionsChange.mockClear();

    // Test with a value above max, which sanitizeDimensionInput will clamp
    fireEvent.change(topWidthInput, { target: { value: '10' } });
    expect(onDimensionsChange).toHaveBeenCalledWith({ ...initialDimensions, topWidth: 5 });

    // Note: This test confirms that sanitizeDimensionInput is working as expected within the component flow.
    // It also highlights that, due to sanitization, `validateTrapezoidalPrismDimensions` in the current flow
    // is unlikely to receive data that it would deem invalid based on its current rules (positive values, widthRatio <= 10)
    // because sanitizeDimensionInput ensures dimensions are positive and within a range (0.5 to 5) that inherently satisfies the widthRatio check.
    // A true test of the component not calling onDimensionsChange (or handling an error) when `validateTrapezoidalPrismDimensions` 
    // itself returns `isValid: false` would require mocking `validateTrapezoidalPrismDimensions` or `updateTrapezoidalPrismDimensions`
    // to simulate a validation failure despite sanitization.
  });

  it('should test validation flow integration - valid dimensions pass through', () => {
    const onDimensionsChange = jest.fn();
    const initialDimensions = { topWidth: 2, bottomWidth: 4, height: 3, depth: 5 };
    
    render(
      <TrapezoidalPrismControls
        dimensions={initialDimensions}
        calculations={defaultCalculations}
        onDimensionsChange={onDimensionsChange}
        onUnfoldChange={jest.fn()}
        visualStyle="solid"
        onVisualStyleChange={jest.fn()}
        labelConfig={defaultLabelConfig}
        onLabelConfigChange={jest.fn()}
      />
    );

    const bottomWidthInput = screen.getByLabelText(/Bottom Width/i);
    
    // Test valid dimension update that maintains valid ratio (topWidth/bottomWidth <= 10)
    fireEvent.change(bottomWidthInput, { target: { value: '4.5' } });
    expect(onDimensionsChange).toHaveBeenCalledWith({ ...initialDimensions, bottomWidth: 4.5 });
  });

  it('should integrate properly with updateTrapezoidalPrismDimensions for multiple dimension changes', () => {
    const onDimensionsChange = jest.fn();
    const initialDimensions = { topWidth: 2, bottomWidth: 4, height: 3, depth: 5 };
    
    render(
      <TrapezoidalPrismControls
        dimensions={initialDimensions}
        calculations={defaultCalculations}
        onDimensionsChange={onDimensionsChange}
        onUnfoldChange={jest.fn()}
        visualStyle="solid"
        onVisualStyleChange={jest.fn()}
        labelConfig={defaultLabelConfig}
        onLabelConfigChange={jest.fn()}
      />
    );

    // Test multiple dimension changes
    const topWidthInput = screen.getByLabelText(/Top Width/i);
    const heightInput = screen.getByLabelText(/Height/i);
    const depthInput = screen.getByLabelText(/Depth/i);
    
    fireEvent.change(topWidthInput, { target: { value: '1.5' } });
    expect(onDimensionsChange).toHaveBeenCalledWith({ ...initialDimensions, topWidth: 1.5 });
    onDimensionsChange.mockClear();
    
    fireEvent.change(heightInput, { target: { value: '4' } });
    expect(onDimensionsChange).toHaveBeenCalledWith({ ...initialDimensions, height: 4 });
    onDimensionsChange.mockClear();
    
    fireEvent.change(depthInput, { target: { value: '2.5' } });
    expect(onDimensionsChange).toHaveBeenCalledWith({ ...initialDimensions, depth: 2.5 });
  });

  it('should test mathematical accuracy by verifying state function integration', () => {
    const onDimensionsChange = jest.fn();
    const initialDimensions = { topWidth: 1, bottomWidth: 5, height: 2, depth: 3 };
    
    render(
      <TrapezoidalPrismControls
        dimensions={initialDimensions}
        calculations={defaultCalculations}
        onDimensionsChange={onDimensionsChange}
        onUnfoldChange={jest.fn()}
        visualStyle="solid"
        onVisualStyleChange={jest.fn()}
        labelConfig={defaultLabelConfig}
        onLabelConfigChange={jest.fn()}
      />
    );

    const topWidthInput = screen.getByLabelText(/Top Width/i);
    
    // Test that precise values are maintained through the state management flow
    fireEvent.change(topWidthInput, { target: { value: '2.5' } });
    
    // Verify the exact value passed to onDimensionsChange
    expect(onDimensionsChange).toHaveBeenCalledWith({ 
      topWidth: 2.5, 
      bottomWidth: 5, 
      height: 2, 
      depth: 3 
    });
    
    // This ensures the mathematical precision is maintained through:
    // 1. sanitizeDimensionInput function
    // 2. updateTrapezoidalPrismDimensions function  
    // 3. validateTrapezoidalPrismDimensions function
  });
});
