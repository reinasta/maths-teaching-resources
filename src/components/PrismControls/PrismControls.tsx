// src/components/PrismControls/PrismControls.tsx
import React, { useState } from 'react';

interface PrismDimensions {
  sideA: number;
  sideB: number;
  sideC: number;
  height: number;
}

interface PrismCalculations {
  triangleHeight: number;
  surfaceArea: number;
  volume: number;
}

interface PrismControlsProps {
  onDimensionsChange: (dimensions: PrismDimensions) => void;
  onUnfoldChange: (isUnfolded: boolean) => void;
  dimensions: PrismDimensions;
  calculations: PrismCalculations;
}

const PrismControls: React.FC<PrismControlsProps> = ({ 
  dimensions, 
  calculations, 
  onDimensionsChange,
  onUnfoldChange 
}) => {
  const [isUnfolded, setIsUnfolded] = useState(false);
  
  const handleUnfoldToggle = () => {
    const newUnfoldState = !isUnfolded;
    setIsUnfolded(newUnfoldState);
    onUnfoldChange(newUnfoldState);
  };

  //const calculateTriangleHeight = useCallback((a: number, b: number, c: number): number => {
  //  // Using Heron's formula
  //  const s = (a + b + c) / 2; // semi-perimeter
  //  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  //  const base = Math.max(a, b, c); // Use longest side as base
  //  return (2 * area) / base;
  //}, []);

  const handleInputChange = (key: keyof PrismDimensions) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    const newDimensions = { ...dimensions, [key]: newValue };
    
    // Validate triangle inequality theorem
    const { sideA, sideB, sideC } = newDimensions;
    if (isValidTriangle(sideA, sideB, sideC)) {
      onDimensionsChange(newDimensions);
    }
  };

  const isValidTriangle = (a: number, b: number, c: number): boolean => {
    return (
      a + b > c &&
      b + c > a &&
      c + a > b
    );
  };

  return (
    <div className="controls-container">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Prism Controls</h3>
        <button
          onClick={handleUnfoldToggle}
          className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {isUnfolded ? 'Fold Prism' : 'Unfold Prism'}
        </button>
        
        <h4 className="text-md font-semibold mb-3">Dimensions</h4>
        <div className="space-y-4">
          <div className="dimension-control">
            <label htmlFor="sideA">Side A Length:</label>
            <input
              type="range"
              id="sideA"
              min="1"
              max="5"
              step="0.5"
              value={dimensions.sideA}
              onChange={handleInputChange('sideA')}
            />
            <span className="value">{dimensions.sideA}</span>
          </div>
          
          <div className="dimension-control">
            <label htmlFor="sideB">Side B Length:</label>
            <input
              type="range"
              id="sideB"
              min="1"
              max="5"
              step="0.5"
              value={dimensions.sideB}
              onChange={handleInputChange('sideB')}
            />
            <span className="value">{dimensions.sideB}</span>
          </div>
          
          <div className="dimension-control">
            <label htmlFor="sideC">Side C Length:</label>
            <input
              type="range"
              id="sideC"
              min="1"
              max="5"
              step="0.5"
              value={dimensions.sideC}
              onChange={handleInputChange('sideC')}
            />
            <span className="value">{dimensions.sideC}</span>
          </div>
          
          <div className="dimension-control">
            <label htmlFor="height">Prism Height:</label>
            <input
              type="range"
              id="height"
              min="1"
              max="5"
              step="0.5"
              value={dimensions.height}
              onChange={handleInputChange('height')}
            />
            <span className="value">{dimensions.height}</span>
          </div>
        </div>
      </div>

      <div className="calculations">
        <h3 className="text-lg font-semibold mb-3">Calculations</h3>
        <div className="space-y-2">
          <div className="calculation-row">
            <span>Triangle Height:</span>
            <span className="font-mono">{calculations.triangleHeight} units</span>
          </div>
          <div className="calculation-row">
            <span>Surface Area:</span>
            <span className="font-mono">{calculations.surfaceArea} sq units</span>
          </div>
          <div className="calculation-row">
            <span>Volume:</span>
            <span className="font-mono">{calculations.volume} cubic units</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrismControls;