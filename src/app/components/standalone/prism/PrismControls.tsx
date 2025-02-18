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
  dimensions: PrismDimensions;
  calculations: PrismCalculations;
  onDimensionsChange: (dimensions: PrismDimensions) => void;
  onUnfoldChange: (isUnfolded: boolean) => void;
}

const PrismControls: React.FC<PrismControlsProps> = ({
  dimensions,
  calculations,
  onDimensionsChange,
  onUnfoldChange
}) => {
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [isUnfolded, setIsUnfolded] = useState(false);

  const handleInputChange = (key: keyof PrismDimensions) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    const newDimensions = { ...dimensions, [key]: newValue };
    onDimensionsChange(newDimensions);
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
          <h3 className="text-lg font-semibold">Prism Controls</h3>
          <button
            onClick={handleUnfoldToggle}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
          >
            {isUnfolded ? 'Fold Prism' : 'Unfold Prism'}
          </button>
        </div>

        <h3 className="text-lg font-semibold mb-3">Prism Dimensions</h3>
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
              className="flex-1"
            />
            <span className="font-mono w-12 text-right">{dimensions.sideA}</span>
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
              className="flex-1"
            />
            <span className="font-mono w-12 text-right">{dimensions.sideB}</span>
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
              className="flex-1"
            />
            <span className="font-mono w-12 text-right">{dimensions.sideC}</span>
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
              className="flex-1"
            />
            <span className="font-mono w-12 text-right">{dimensions.height}</span>
          </div>
        </div>
      </div>

      <div className="calculations">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Measurements</h3>
          <button
            onClick={() => setShowMeasurements(prev => !prev)}
            className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {showMeasurements ? 'Hide' : 'Show'} Values
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
            <span>Triangle Height:</span>
            <span className="font-mono">{calculations.triangleHeight.toFixed(2)} units</span>
          </div>
          
          <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
            <span>Surface Area:</span>
            <span className="font-mono">
              {showMeasurements 
                ? `${calculations.surfaceArea.toFixed(2)} sq units`
                : '***'}
            </span>
          </div>
          
          <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
            <span>Volume:</span>
            <span className="font-mono">
              {showMeasurements 
                ? `${calculations.volume.toFixed(2)} cubic units`
                : '***'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrismControls;