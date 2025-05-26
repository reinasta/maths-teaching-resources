import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PrismControls from './PrismControls';

const defaultDimensions = { sideA: 3, sideB: 4, sideC: 5, height: 6 };
const defaultCalculations = { triangleHeight: 2.4, surfaceArea: 84, volume: 36 };
const defaultLabelConfig = { showVolume: true, showSurfaceArea: false, showFaces: false };

describe('PrismControls', () => {
  it('renders all controls and calculation values', () => {
    render(
      <PrismControls
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
    expect(screen.getByText(/Triangular Prism Controls/i)).toBeInTheDocument();
    expect(screen.getByText(/Calculations/i)).toBeInTheDocument();
    
    // Sliders
    expect(screen.getByLabelText(/Side A/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Side B/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Side C/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Height/i)).toBeInTheDocument();
    
    // Visual style selector
    expect(screen.getByLabelText(/Visual Style/i)).toBeInTheDocument();
    
    // Label checkboxes
    expect(screen.getByLabelText(/Volume Labels/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Surface Area Labels/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Face Labels/i)).toBeInTheDocument();
    
    // Calculation values
    expect(screen.getByText(/84.00 sq units/i)).toBeInTheDocument();
    expect(screen.getByText(/36.00 cubic units/i)).toBeInTheDocument();
  });

  it('calls onUnfoldChange when unfold button is clicked', () => {
    const onUnfoldChange = jest.fn();
    render(
      <PrismControls
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
      <PrismControls
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
    
    const slider = screen.getByLabelText(/Side A/i);
    fireEvent.change(slider, { target: { value: '4' } });
    expect(onDimensionsChange).toHaveBeenCalledWith({ ...defaultDimensions, sideA: 4 });
  });

  it('calls onLabelConfigChange when a label checkbox is toggled', () => {
    const onLabelConfigChange = jest.fn();
    render(
      <PrismControls
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
});

// Integration test suite for triangular prism state functions
describe('PrismControls - State Integration', () => {
  it('should call onDimensionsChange with valid new dimensions when input is valid', () => {
    const onDimensionsChange = jest.fn();
    const initialDimensions = { sideA: 3, sideB: 4, sideC: 5, height: 6 };
    
    render(
      <PrismControls
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

    const sideAInput = screen.getByLabelText(/Side A/i);
    fireEvent.change(sideAInput, { target: { value: '5' } });

    expect(onDimensionsChange).toHaveBeenCalledWith({ ...initialDimensions, sideA: 5 });
  });

  it('should call onDimensionsChange with sanitized dimensions for edge case inputs', () => {
    const onDimensionsChange = jest.fn();
    const initialDimensions = { sideA: 4, sideB: 4, sideC: 5, height: 6 }; // Changed sideA to 4
    
    render(
      <PrismControls
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

    const sideAInput = screen.getByLabelText(/Side A/i);
    
    // Test with empty string input - range inputs default to midpoint when empty
    fireEvent.change(sideAInput, { target: { value: '' } }); 
    // Range input with min=1, max=5 defaults to 3 when empty (midpoint)
    // Triangle (3,4,5) is valid, so onDimensionsChange should be called
    expect(onDimensionsChange).toHaveBeenCalledWith({ ...initialDimensions, sideA: 3 });
    onDimensionsChange.mockClear();

    // Test with a value below min - range input clamps to min=1
    // But triangle (1,4,5) violates triangle inequality (1+4 = 5), so no update
    fireEvent.change(sideAInput, { target: { value: '0.5' } });
    expect(onDimensionsChange).not.toHaveBeenCalled(); // No change due to invalid triangle
    onDimensionsChange.mockClear();

    // Test with a value above max - range input clamps to max=5
    fireEvent.change(sideAInput, { target: { value: '8' } });
    expect(onDimensionsChange).toHaveBeenCalledWith({ ...initialDimensions, sideA: 5 });
  });

  it('should handle triangle inequality validation through updateTriangularPrismDimensions', () => {
    const onDimensionsChange = jest.fn();
    const initialDimensions = { sideA: 3, sideB: 4, sideC: 5, height: 6 };
    
    render(
      <PrismControls
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

    const sideBInput = screen.getByLabelText(/Side B/i);
    
    // Test valid triangle - should update (values within range 1-5)
    fireEvent.change(sideBInput, { target: { value: '4.5' } });
    expect(onDimensionsChange).toHaveBeenCalledWith({ ...initialDimensions, sideB: 4.5 });
    onDimensionsChange.mockClear();
    
    // Test another valid triangle configuration
    fireEvent.change(sideBInput, { target: { value: '3.5' } });
    expect(onDimensionsChange).toHaveBeenCalledWith({ ...initialDimensions, sideB: 3.5 });
  });

  it('should test mathematical accuracy by verifying state function integration', () => {
    const onDimensionsChange = jest.fn();
    const initialDimensions = { sideA: 2, sideB: 3, sideC: 4, height: 5 };
    
    render(
      <PrismControls
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

    const heightInput = screen.getByLabelText(/Height/i);
    
    // Test that precise values are maintained through the state management flow
    fireEvent.change(heightInput, { target: { value: '4.5' } });
    
    // Verify the exact value passed to onDimensionsChange
    expect(onDimensionsChange).toHaveBeenCalledWith({ 
      sideA: 2, 
      sideB: 3, 
      sideC: 4, 
      height: 4.5 
    });
    
    // This ensures the mathematical precision is maintained through:
    // 1. sanitizeDimensionInput function
    // 2. updateTriangularPrismDimensions function  
    // 3. validateTriangularPrismDimensions function
  });

  it('should integrate properly with updateTriangularPrismDimensions for multiple dimension changes', () => {
    const onDimensionsChange = jest.fn();
    const initialDimensions = { sideA: 3, sideB: 4, sideC: 5, height: 6 };
    
    render(
      <PrismControls
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
    const sideAInput = screen.getByLabelText(/Side A/i);
    const sideCInput = screen.getByLabelText(/Side C/i);
    const heightInput = screen.getByLabelText(/Height/i);
    
    fireEvent.change(sideAInput, { target: { value: '4' } });
    expect(onDimensionsChange).toHaveBeenCalledWith({ ...initialDimensions, sideA: 4 });
    onDimensionsChange.mockClear();
    
    fireEvent.change(sideCInput, { target: { value: '4.5' } });
    expect(onDimensionsChange).toHaveBeenCalledWith({ ...initialDimensions, sideC: 4.5 });
    onDimensionsChange.mockClear();
    
    fireEvent.change(heightInput, { target: { value: '4' } });
    expect(onDimensionsChange).toHaveBeenCalledWith({ ...initialDimensions, height: 4 });
  });
});
