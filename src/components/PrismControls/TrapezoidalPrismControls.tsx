import React, { useState } from 'react';
import { TrapezoidalPrismDimensions, VisualStyle, LabelConfig } from '../../app/components/standalone/trapezoidal-prism/types';

interface TrapezoidalPrismCalculations {
  leftSide: number;
  rightSide: number;
  surfaceArea: number;
  volume: number;
}

interface TrapezoidalPrismControlsProps {
  onDimensionsChange: (dimensions: TrapezoidalPrismDimensions) => void;
  onUnfoldChange: (isUnfolded: boolean) => void;
  onVisualStyleChange: (style: VisualStyle) => void;
  dimensions: TrapezoidalPrismDimensions;
  calculations: TrapezoidalPrismCalculations;
  visualStyle: VisualStyle;
  labelConfig?: LabelConfig;
  onLabelConfigChange?: (config: LabelConfig) => void;
}

const DEFAULT_LABEL_CONFIG: LabelConfig = {
  showVolume: true,
  showSurfaceArea: false,
  showFaces: false
};

const TrapezoidalPrismControls: React.FC<TrapezoidalPrismControlsProps> = ({ 
  dimensions, 
  calculations, 
  onDimensionsChange,
  onUnfoldChange,
  visualStyle,
  onVisualStyleChange,
  labelConfig = DEFAULT_LABEL_CONFIG,
  onLabelConfigChange
}) => {
  const [isUnfolded, setIsUnfolded] = useState(false);
  
  const handleUnfoldToggle = () => {
    const newUnfoldState = !isUnfolded;
    setIsUnfolded(newUnfoldState);
    onUnfoldChange(newUnfoldState);
  };

  const handleInputChange = (key: keyof TrapezoidalPrismDimensions) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    const newDimensions = { ...dimensions, [key]: newValue };
    onDimensionsChange(newDimensions);
  };

  const handleStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onVisualStyleChange(event.target.value as VisualStyle);
  };

  const handleLabelConfigChange = (key: keyof LabelConfig) => {
    if (onLabelConfigChange) {
      onLabelConfigChange({
        ...labelConfig,
        [key]: !labelConfig[key]
      });
    }
  };

  return (
    <div className="controls-container">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Trapezoidal Prism Controls</h3>
        
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
        
        <div className="mb-4">
          <h4 className="text-md font-semibold mb-2">Label Options</h4>
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
        
        <h4 className="text-md font-semibold mb-3">Dimensions</h4>
        <div className="space-y-4">
          <div className="dimension-control">
            <label htmlFor="topWidth">Top Width:</label>
            <input
              type="range"
              id="topWidth"
              min="1"
              max="5"
              step="0.5"
              value={dimensions.topWidth}
              onChange={handleInputChange('topWidth')}
            />
            <span className="value">{dimensions.topWidth}</span>
          </div>
          
          <div className="dimension-control">
            <label htmlFor="bottomWidth">Bottom Width:</label>
            <input
              type="range"
              id="bottomWidth"
              min="1"
              max="5"
              step="0.5"
              value={dimensions.bottomWidth}
              onChange={handleInputChange('bottomWidth')}
            />
            <span className="value">{dimensions.bottomWidth}</span>
          </div>
          
          <div className="dimension-control">
            <label htmlFor="height">Height:</label>
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
          
          <div className="dimension-control">
            <label htmlFor="depth">Depth:</label>
            <input
              type="range"
              id="depth"
              min="1"
              max="5"
              step="0.5"
              value={dimensions.depth}
              onChange={handleInputChange('depth')}
            />
            <span className="value">{dimensions.depth}</span>
          </div>
        </div>
      </div>

      <div className="calculations">
        <h3 className="text-lg font-semibold mb-3">Calculations</h3>
        <div className="space-y-2">
          <div className="calculation-row">
            <span>Left Side:</span>
            <span className="font-mono">{calculations.leftSide.toFixed(2)} units</span>
          </div>
          <div className="calculation-row">
            <span>Right Side:</span>
            <span className="font-mono">{calculations.rightSide.toFixed(2)} units</span>
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

export default TrapezoidalPrismControls;