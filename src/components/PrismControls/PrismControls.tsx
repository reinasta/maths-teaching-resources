import React, { useState } from 'react';
import { PrismDimensions, VisualStyle, LabelConfig } from '../Prism/prism.types';
import { 
  updateTriangularPrismDimensions, 
  updateLabelConfig,
  sanitizeDimensionInput
} from '../../utils/state/prismState';
import DimensionControl from './DimensionControl';
import LabelConfigControl from './LabelConfigControl';
import VisualStyleSelector from './VisualStyleSelector';
import CalculationsDisplay from './CalculationsDisplay';

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
        <button
          onClick={handleUnfoldToggle}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mb-4"
        >
          {isUnfolded ? 'Fold Prism' : 'Unfold Prism'}
        </button>
        
        <VisualStyleSelector visualStyle={visualStyle} onVisualStyleChange={handleStyleChange} />
        
        <h4 className="text-md font-semibold mb-3">Dimensions</h4>
        <div className="space-y-4">
          <DimensionControl label="Side A" value={dimensions.sideA} onChange={(value) => handleInputChange('sideA')(value)} />
          <DimensionControl label="Side B" value={dimensions.sideB} onChange={(value) => handleInputChange('sideB')(value)} />
          <DimensionControl label="Side C" value={dimensions.sideC} onChange={(value) => handleInputChange('sideC')(value)} />
          <DimensionControl label="Height" value={dimensions.height} onChange={(value) => handleInputChange('height')(value)} />
        </div>
      </div>

      <LabelConfigControl labelConfig={labelConfig} onLabelConfigChange={handleLabelConfigChange} />

      <CalculationsDisplay 
        triangleHeight={calculations.triangleHeight} 
        surfaceArea={calculations.surfaceArea} 
        volume={calculations.volume} 
      />

      <div className="mb-4">
        <h4 className="text-md font-semibold mb-2">Labels</h4>
        <div className="space-y-2">
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
