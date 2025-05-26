import React, { useState } from 'react';
import DimensionControl from './DimensionControl';
import LabelConfigControl from './LabelConfigControl';
import VisualStyleSelector from './VisualStyleSelector';
import CalculationsDisplay from './CalculationsDisplay';
import { PrismDimensions, VisualStyle, LabelConfig } from '../Prism/prism.types';
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
          
          <VisualStyleSelector 
            visualStyle={visualStyle} 
            onVisualStyleChange={onVisualStyleChange} 
          />
        </div>
        
        <h4 className="text-md font-semibold mb-3">Dimensions</h4>
        <div className="space-y-4">
          <DimensionControl 
            label="Side A" 
            value={dimensions.sideA} 
            onChange={handleInputChange('sideA')} 
          />
          <DimensionControl 
            label="Side B" 
            value={dimensions.sideB} 
            onChange={handleInputChange('sideB')} 
          />
          <DimensionControl 
            label="Side C" 
            value={dimensions.sideC} 
            onChange={handleInputChange('sideC')} 
          />
          <DimensionControl 
            label="Height" 
            value={dimensions.height} 
            onChange={handleInputChange('height')} 
          />
        </div>
      </div>

      <LabelConfigControl 
        labelConfig={labelConfig} 
        onLabelConfigChange={handleLabelConfigChange} 
      />

      <CalculationsDisplay 
        triangleHeight={calculations.triangleHeight} 
        surfaceArea={calculations.surfaceArea} 
        volume={calculations.volume} 
      />
    </div>
  );
};

export default PrismControls;
