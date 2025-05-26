import React, { useState } from 'react';
import { PrismDimensions, VisualStyle, LabelConfig } from '../Prism/Prism';
import { 
  updateTriangularPrismDimensions, 
  updateLabelConfig,
  sanitizeDimensionInput
} from '../../utils/state/prismState';

interface PrismCalculations {
  triangleHeight: number;
  surfaceArea: number;
  volume: number;
}

interface PrismControlsProps {
  onDimensionsChange: (dimensions: PrismDimensions) => void;
  onUnfoldChange: (isUnfolded: boolean) => void;
  onVisualStyleChange: (style: VisualStyle) => void;
  onLabelConfigChange?: (config: LabelConfig) => void; // Add this prop
  dimensions: PrismDimensions;
  calculations: PrismCalculations;
  visualStyle: VisualStyle;
  labelConfig?: LabelConfig; // Add this prop
}

// Default label config in case it's not provided
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
  visualStyle,
  onVisualStyleChange,
  onLabelConfigChange,
  labelConfig = DEFAULT_LABEL_CONFIG // Default if not provided
}) => {
  const [isUnfolded, setIsUnfolded] = useState(false);
  
  const handleUnfoldToggle = () => {
    const newUnfoldState = !isUnfolded;
    setIsUnfolded(newUnfoldState);
    onUnfoldChange(newUnfoldState);
  };

  const handleInputChange = (key: keyof PrismDimensions) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeDimensionInput(event.target.value, 0.5, 5);
    const updates = { [key]: sanitizedValue };
    
    const result = updateTriangularPrismDimensions(dimensions, updates);
    if (result.isValid) {
      onDimensionsChange(result.dimensions);
    }
    // If invalid, dimensions remain unchanged (current dimensions are returned)
  };

  const handleStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onVisualStyleChange(event.target.value as VisualStyle);
  };

  const handleLabelConfigChange = (key: keyof LabelConfig) => {
    if (onLabelConfigChange) {
      const updatedConfig = updateLabelConfig(labelConfig, { [key]: !labelConfig[key] });
      onLabelConfigChange(updatedConfig);
    }
  };

  return (
    <div className="controls-container">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Triangular Prism Controls</h3>
        <div className="mb-4 flex flex-col space-y-2">
          <button
            onClick={handleUnfoldToggle}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {isUnfolded ? 'Fold Prism' : 'Unfold Prism'}
          </button>
          
          <div className="visual-style-selector">
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
        </div>
        
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

      <div className="mb-4">
        <h4 className="text-md font-semibold mb-2">Labels</h4>
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
        <h3 className="text-lg font-semibold mb-3">Calculations</h3>
        <div className="space-y-2">
          <div className="calculation-row">
            <span>Triangle Height:</span>
            <span className="font-mono">{calculations.triangleHeight.toFixed(2)} units</span>
          </div>
          <div className="calculation-row">
            <span>Surface Area:</span>
            <span className="font-mono">{calculations.surfaceArea.toFixed(2)} sq units</span>
          </div>
          <div className="calculation-row">
            <span>Volume:</span>
            <span className="font-mono">{calculations.volume.toFixed(2)} cubic units</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrismControls;