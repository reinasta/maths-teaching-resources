import React, { useState } from 'react';
import { 
  updateTriangularPrismDimensions, 
  updateLabelConfig,
  sanitizeDimensionInput,
  type PrismDimensions,
  type LabelConfig
} from '../../../../utils/state/prismState';

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
  visualStyle?: string;
  onVisualStyleChange?: (style: string) => void;
  // Add the new props
  labelConfig?: LabelConfig;
  onLabelConfigChange?: (config: LabelConfig) => void;
}

// Default label config
const DEFAULT_LABEL_CONFIG: LabelConfig = {
  showVolume: true,
  showSurfaceArea: false,
  showFaces: false
};

const PrismControls: React.FC<PrismControlsProps> = ({
  dimensions,
  calculations,
  onDimensionsChange,
  onUnfoldChange,
  visualStyle = 'solid',
  onVisualStyleChange,
  // Add defaults and destructure new props
  labelConfig = DEFAULT_LABEL_CONFIG,
  onLabelConfigChange
}) => {
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [isUnfolded, setIsUnfolded] = useState(false);

  // Existing handlers...
  const handleInputChange = (key: keyof PrismDimensions) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeDimensionInput(event.target.value, 0.5, 5);
    const updates = { [key]: sanitizedValue };
    
    const result = updateTriangularPrismDimensions(dimensions, updates);
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

  const handleStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (onVisualStyleChange) {
      onVisualStyleChange(event.target.value);
    }
  };

  // Add handler for label config changes
  const handleLabelConfigChange = (key: keyof LabelConfig) => {
    if (onLabelConfigChange) {
      const updatedConfig = updateLabelConfig(labelConfig, { [key]: !labelConfig[key] });
      onLabelConfigChange(updatedConfig);
    }
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

        {/* Add Visual Style Selector */}
        <div className="mb-4">
          <label htmlFor="visualStyle" className="block text-sm font-medium mb-1">Visual Style:</label>
          <select
            id="visualStyle"
            value={visualStyle}
            onChange={handleStyleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="solid">Solid</option>
            <option value="colored">Colored Faces</option>
            <option value="wireframe">Wireframe</option>
          </select>
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

      {/* Add the label controls section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Label Options</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={labelConfig.showVolume}
              onChange={() => handleLabelConfigChange('showVolume')}
              className="mr-2"
            />
            Volume Labels
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={labelConfig.showSurfaceArea}
              onChange={() => handleLabelConfigChange('showSurfaceArea')}
              className="mr-2"
            />
            Surface Area Labels
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={labelConfig.showFaces}
              onChange={() => handleLabelConfigChange('showFaces')}
              className="mr-2"
            />
            Face Labels
          </label>
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