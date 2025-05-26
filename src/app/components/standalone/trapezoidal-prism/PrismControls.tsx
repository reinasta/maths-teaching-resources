import React, { useState } from 'react';
import { TrapezoidalPrismDimensions, TrapezoidalPrismCalculations } from './types';
import { 
  updateTrapezoidalPrismDimensions, 
  sanitizeDimensionInput
} from '../../../../utils/state/prismState';

interface TrapezoidalPrismControlsProps {
  dimensions: TrapezoidalPrismDimensions;
  calculations: TrapezoidalPrismCalculations;
  onDimensionsChange: (dimensions: TrapezoidalPrismDimensions) => void;
  onUnfoldChange: (isUnfolded: boolean) => void;
}

const TrapezoidalPrismControls: React.FC<TrapezoidalPrismControlsProps> = ({
  dimensions,
  calculations,
  onDimensionsChange,
  onUnfoldChange
}) => {
  const [_showMeasurements, _setShowMeasurements] = useState(true);
  const [isUnfolded, setIsUnfolded] = useState(false);

  const handleInputChange = (key: keyof TrapezoidalPrismDimensions) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeDimensionInput(event.target.value, 0.5, 5);
    const updates = { [key]: sanitizedValue };
    
    const result = updateTrapezoidalPrismDimensions(dimensions, updates);
    if (result.isValid) {
      onDimensionsChange(result.dimensions);
    }
    // If invalid, dimensions remain unchanged (current dimensions are returned)
  };

  const handleUnfoldToggle = () => {
    const newUnfoldState = !isUnfolded;
    setIsUnfolded(newUnfoldState);
    onUnfoldChange(newUnfoldState);
  };

  return (
    <div className="controls-container p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Trapezoidal Prism Controls</h3>
          <button
            onClick={handleUnfoldToggle}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
          >
            {isUnfolded ? 'Fold Prism' : 'Unfold Prism'}
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="dimension-control">
            <label htmlFor="topWidth" className="block text-sm font-medium text-gray-700 mb-1">
              Top Width: {dimensions.topWidth}
            </label>
            <input
              type="range"
              id="topWidth"
              min="1"
              max="5"
              step="0.1"
              value={dimensions.topWidth}
              onChange={handleInputChange('topWidth')}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="dimension-control">
            <label htmlFor="bottomWidth" className="block text-sm font-medium text-gray-700 mb-1">
              Bottom Width: {dimensions.bottomWidth}
            </label>
            <input
              type="range"
              id="bottomWidth"
              min="1"
              max="5"
              step="0.1"
              value={dimensions.bottomWidth}
              onChange={handleInputChange('bottomWidth')}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="dimension-control">
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
              Height: {dimensions.height}
            </label>
            <input
              type="range"
              id="height"
              min="1"
              max="5"
              step="0.1"
              value={dimensions.height}
              onChange={handleInputChange('height')}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="dimension-control">
            <label htmlFor="depth" className="block text-sm font-medium text-gray-700 mb-1">
              Depth: {dimensions.depth}
            </label>
            <input
              type="range"
              id="depth"
              min="1"
              max="5"
              step="0.1"
              value={dimensions.depth}
              onChange={handleInputChange('depth')}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-md font-semibold mb-3">Calculations</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Surface Area:</span>
            <span className="font-mono">{calculations.surfaceArea} square units</span>
          </div>
          <div className="flex justify-between">
            <span>Volume:</span>
            <span className="font-mono">{calculations.volume} cubic units</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrapezoidalPrismControls;